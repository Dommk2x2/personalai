
import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceEntry, AttendanceStatus } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from './Icons';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_PROFILE_PICTURE_KEY } from '../constants';

interface YearlyAttendanceGridProps {
  attendanceEntries: AttendanceEntry[];
  appTitle: string;
  startDate: string | null;
}

const YearlyAttendanceGrid: React.FC<YearlyAttendanceGridProps> = ({ attendanceEntries, appTitle, startDate }) => {
  const { currentThemeColors } = useTheme();
  const [profilePicture] = useLocalStorage<string | null>(LOCAL_STORAGE_PROFILE_PICTURE_KEY, null);
  
  const initialYear = useMemo(() => 
    startDate ? new Date(startDate + 'T00:00:00').getFullYear() : new Date().getFullYear(),
    [startDate]
  );

  const [currentYear, setCurrentYear] = useState(initialYear);

  useEffect(() => {
    setCurrentYear(initialYear);
  }, [initialYear]);

  const getStatusInfo = (status: AttendanceStatus | undefined) => {
    if (!status) return { shortCode: '', color: currentThemeColors.textMuted, bgColor: 'transparent' };
    
    let info = { shortCode: '?', color: currentThemeColors.textMuted, bgColor: currentThemeColors.bgAccent };

    switch (status) {
      case AttendanceStatus.PRESENT:
        info = { shortCode: 'P', color: currentThemeColors.income, bgColor: `${currentThemeColors.income}33` };
        break;
      case AttendanceStatus.ABSENT:
        info = { shortCode: 'A', color: currentThemeColors.expense, bgColor: `${currentThemeColors.expense}33` };
        break;
      case AttendanceStatus.SICK_LEAVE:
        info = { shortCode: 'SL', color: currentThemeColors.expense, bgColor: `${currentThemeColors.expense}33` };
        break;
      case AttendanceStatus.CASUAL_LEAVE:
        info = { shortCode: 'CL', color: currentThemeColors.expense, bgColor: `${currentThemeColors.expense}33` };
        break;
      case AttendanceStatus.HALF_DAY_PRESENT:
        info = { shortCode: 'HD', color: '#25b9c5', bgColor: '#25b9c533' };
        break;
      case AttendanceStatus.WORK_FROM_HOME:
        info = { shortCode: 'WFH', color: '#3b82f6', bgColor: '#3b82f633' };
        break;
      case AttendanceStatus.WEEKLY_OFF:
        info = { shortCode: 'WO', color: currentThemeColors.textMuted, bgColor: currentThemeColors.bgAccent };
        break;
    }
    return info;
  };

  const { gridData, yearlyTotals } = useMemo(() => {
    const data: Record<number, Record<number, AttendanceStatus | undefined>> = {};
    const safeEntries = attendanceEntries ?? [];
    const yearEntries = safeEntries.filter(e => {
      const date = new Date(e.date + 'T00:00:00');
      const year = date.getFullYear();
      console.log('Entry:', e, 'Date:', date, 'Year:', year, 'CurrentYear:', currentYear);
      return year === currentYear;
    });
    
    for (let month = 0; month < 12; month++) {
      data[month] = {};
    }

    const totals: Record<string, number> = {};
    Object.values(AttendanceStatus).forEach(s => { totals[s] = 0; });

    yearEntries.forEach(entry => {
      const date = new Date(entry.date + 'T00:00:00');
      const month = date.getMonth();
      const day = date.getDate();
      data[month][day] = entry.status;
      totals[entry.status] = (totals[entry.status] || 0) + 1;
    });

    return { gridData: data, yearlyTotals: totals };
  }, [currentYear, attendanceEntries]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const daysHeader = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const reportTitle = `${appTitle} - Yearly Attendance Report for ${currentYear}`;
    
    doc.setFontSize(16);
    doc.text(reportTitle, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);

    let yPos = 25;

    if (Object.values(yearlyTotals).some(count => (count as number) > 0)) {
        doc.setFontSize(12);
        doc.text('Yearly Attendance Summary', 14, yPos);
        yPos += 7;

        const summaryBody = Object.entries(yearlyTotals)
            .filter(([, count]) => (count as number) > 0)
            .map(([status, count]) => [status.replace(/_/g, ' '), count]);

        autoTable(doc, {
            startY: yPos,
            head: [['Status', 'Total Days']],
            body: summaryBody,
            theme: 'striped',
            headStyles: { fillColor: currentThemeColors.brandPrimary },
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
    }
    
    const hexToRgb = (hex: string): [number, number, number] | null => {
        if (!hex || typeof hex !== 'string') return null;

        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
        if (!result) return null;

        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        const a = result[4] ? parseInt(result[4], 16) / 255 : 1;

        if (a < 1) {
            r = Math.round(r * a + 255 * (1 - a));
            g = Math.round(g * a + 255 * (1 - a));
            b = Math.round(b * a + 255 * (1 - a));
        }

        return [r, g, b];
    };

    const head = [['Day', ...monthNames]];
    const body: (string | number)[][] = [];
    
    daysHeader.forEach(day => {
      const row: (string|number)[] = [day];
      monthNames.forEach((_, monthIndex) => {
        const daysInThisMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
        if (day > daysInThisMonth) {
          row.push('');
        } else {
          const status = gridData[monthIndex]?.[day];
          const { shortCode } = getStatusInfo(status);
          row.push(shortCode);
        }
      });
      body.push(row);
    });

    autoTable(doc, {
      startY: yPos,
      head: head,
      body: body,
      theme: 'grid',
      styles: { fontSize: 7, halign: 'center', cellPadding: 1 },
      headStyles: { fillColor: currentThemeColors.brandPrimary },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0) {
          const day = data.row.index + 1;
          const monthIndex = data.column.index - 1;
          const daysInThisMonth = new Date(currentYear, monthIndex + 1, 0).getDate();

          if (day > daysInThisMonth) {
            data.cell.styles.fillColor = [230, 230, 230];
          } else {
            const status = gridData[monthIndex]?.[day];
            const { bgColor, color: textColor } = getStatusInfo(status);
            
            if (bgColor && bgColor !== 'transparent') {
              const rgbBg = hexToRgb(bgColor);
              if (rgbBg) {
                data.cell.styles.fillColor = rgbBg;
              }
            }
            if (textColor) {
                const rgbText = hexToRgb(textColor);
                if (rgbText) {
                    data.cell.styles.textColor = rgbText;
                }
            }
          }
        }
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });

    doc.save(`Yearly_Attendance_${currentYear}.pdf`);
  };

  const Legend = () => {
    const statuses = Object.values(AttendanceStatus);
    return (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {statuses.map(status => {
                const { shortCode, color, bgColor } = getStatusInfo(status as AttendanceStatus);
                return (
                    <div key={status} className="flex items-center">
                        <span className="font-bold w-8 text-center py-0.5 rounded-sm mr-1.5" style={{ color, backgroundColor: bgColor }}>
                            {shortCode}
                        </span>
                        <span>{status.replace(/_/g, ' ')}</span>
                    </div>
                )
            })}
        </div>
    );
  };
  
  const YearlySummary = () => {
    const summaryData = Object.entries(yearlyTotals)
        .filter(([, count]) => (count as number) > 0)
        .sort((a,b) => (b[1] as number) - (a[1] as number));
    
    if (summaryData.length === 0) return null;

    return (
        <div className="mt-6 pt-4 border-t" style={{ borderColor: currentThemeColors.borderSecondary }}>
            <h4 className="font-semibold text-lg mb-3" style={{ color: currentThemeColors.textBase }}>Yearly Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {summaryData.map(([status, count]) => {
                    const { color } = getStatusInfo(status as AttendanceStatus);
                    return (
                        <div key={status} className="p-3 rounded-lg flex items-center shadow-md bg-bg-primary-themed">
                            <div className="flex-grow">
                                <p className="text-xs font-medium" style={{ color }}>{status.replace(/_/g, ' ')}</p>
                                <p className="text-2xl font-bold" style={{ color }}>{count}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentYear(y => y - 1)} className="p-2 rounded-full hover:bg-bg-accent-themed"><ChevronLeftIcon /></button>
          <span className="text-xl font-bold text-brand-primary">{currentYear}</span>
          <button onClick={() => setCurrentYear(y => y + 1)} className="p-2 rounded-full hover:bg-bg-accent-themed"><ChevronRightIcon /></button>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md text-text-inverted bg-brand-secondary hover:opacity-90"
        >
          <DownloadIcon className="w-4 h-4 mr-2" /> Download PDF
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg" style={{ borderColor: currentThemeColors.borderPrimary }}>
        <table className="min-w-full text-xs text-center border-collapse">
          <thead className="sticky top-0 z-10">
            <tr style={{ backgroundColor: currentThemeColors.bgAccent }}>
              <th className="sticky left-0 p-2 border-r" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>Day</th>
              {monthNames.map(month => (
                <th key={month} className="p-2 border-l" style={{ borderColor: currentThemeColors.borderSecondary }}>{month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daysHeader.map(day => {
              return (
                <tr key={day} className="border-t" style={{ borderColor: currentThemeColors.borderSecondary }}>
                  <td className="sticky left-0 font-semibold p-2 border-r text-left" style={{ backgroundColor: currentThemeColors.bgAccent, borderColor: currentThemeColors.borderSecondary }}>{day}</td>
                  {monthNames.map((_, monthIndex) => {
                    const daysInThisMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
                    if (day > daysInThisMonth) {
                      return <td key={monthIndex} className="p-2 border-l" style={{ backgroundColor: currentThemeColors.bgPrimary, borderColor: currentThemeColors.borderSecondary }}></td>;
                    }
                    const status = gridData[monthIndex]?.[day];
                    const { shortCode, color, bgColor } = getStatusInfo(status);
                    return (
                      <td key={monthIndex} className="p-2 border-l font-bold" style={{ borderColor: currentThemeColors.borderSecondary, color, backgroundColor: bgColor }}>
                        {shortCode}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Legend />
      <YearlySummary />
    </div>
  );
};

export default YearlyAttendanceGrid;
