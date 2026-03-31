import React, { useState, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';
import Papa from 'papaparse';
import { GoogleGenAI, Type } from "@google/genai";
import { useTheme } from '../contexts/ThemeContext';
import { Account, TransactionType, AddTransactionFormPayload, IncomeExpenseTransactionDetails } from '../types';
import { SparklesIcon, AlertTriangleIcon, TrashIcon } from './Icons';
import { useAccounts } from '../contexts/AccountContext';

// Configure the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

interface PdfImporterProps {
  onImportTransactions: (transactions: AddTransactionFormPayload[]) => void;
  incomeCategories: string[];
  expenseCategories: string[];
}

interface ParsedTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  isSelected: boolean;
}

interface GeminiTransaction {
    date: string;
    description: string;
    debit: number | null;
    credit: number | null;
}

type ImportStep = 'upload' | 'preview' | 'parsing' | 'review' | 'error';

const PdfImporter: React.FC<PdfImporterProps> = ({ onImportTransactions, incomeCategories, expenseCategories }) => {
  const { currentThemeColors } = useTheme();
  const { accounts, activeAccountId } = useAccounts();
  
  const [file, setFile] = useState<File | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [importAccountId, setImportAccountId] = useState<string | null>(activeAccountId);
  
  // New state for multi-step UI
  const [step, setStep] = useState<ImportStep>('upload');
  const [pdfTextPreview, setPdfTextPreview] = useState('');
  const [fullPdfText, setFullPdfText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterKeyword, setFilterKeyword] = useState('');


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      resetToUpload(false); // Don't clear file input visually
      if (selectedFile.type === 'application/pdf') {
        parsePdf(selectedFile);
      } else if (selectedFile.type === 'application/json') {
        parseJson(selectedFile);
      } else if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        parseCsv(selectedFile);
      } else {
        setError("Unsupported file type. Please upload a PDF, JSON, or CSV file.");
        setStep('error');
      }
    }
  };

  const parseCsv = async (csvFile: File) => {
    setStep('parsing');
    setLoadingMessage('Reading CSV file...');
    setError(null);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          
          const transactions: ParsedTransaction[] = data.filter(tx => tx).map((tx: any) => {
            // Flexible field extraction
            const dateRaw = tx.date || tx.transactionDate || tx.timestamp || new Date().toISOString().split('T')[0];
            const description = tx.description || tx.desc || tx.name || tx.title || 'Unknown';
            const amount = Number(tx.amount || tx.amt || tx.value || tx.price || 0);
            const type = (tx.type || tx.transactionType || '').toLowerCase() === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE;
            
            // Date parsing: DD/MM/YYYY -> YYYY-MM-DD
            let formattedDate = dateRaw;
            if (typeof dateRaw === 'string' && dateRaw.includes('/')) {
                const parts = dateRaw.split('/');
                if (parts.length === 3) {
                    // Assuming DD/MM/YYYY
                    formattedDate = `${parts[2]}-${parts[1]?.padStart(2, '0')}-${parts[0]?.padStart(2, '0')}`;
                }
            }

            return {
              id: crypto.randomUUID(),
              date: formattedDate,
              description,
              amount,
              type,
              category: tx.category || '',
              isSelected: true,
            };
          });

          setParsedTransactions(transactions);
          setStep('review');
        } catch (err) {
          console.error("Error parsing CSV:", err);
          setError("Failed to parse CSV file. Please ensure it is a valid CSV with headers.");
          setStep('error');
        } finally {
          setLoadingMessage('');
        }
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
        setError("Failed to parse CSV file.");
        setStep('error');
        setLoadingMessage('');
      }
    });
  };

  const parseJson = async (jsonFile: File) => {
    setStep('parsing');
    setLoadingMessage('Reading JSON file...');
    setError(null);
    try {
      const text = await jsonFile.text();
      const data = JSON.parse(text);
      
      // Assuming data is an array of transactions
      if (!Array.isArray(data)) {
        throw new Error("Invalid JSON format. Expected an array of transactions.");
      }

      const transactions: ParsedTransaction[] = data.filter((tx: any) => tx).map((tx: any) => {
        // Flexible field extraction
        const dateRaw = tx.date || tx.transactionDate || tx.timestamp || new Date().toISOString().split('T')[0];
        const description = tx.description || tx.desc || tx.name || tx.title || 'Unknown';
        const amount = Number(tx.amount || tx.amt || tx.value || tx.price || 0);
        const type = (tx.type || tx.transactionType || '').toLowerCase() === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE;
        
        // Date parsing: DD/MM/YYYY -> YYYY-MM-DD
        let formattedDate = dateRaw;
        if (typeof dateRaw === 'string' && dateRaw.includes('/')) {
            const parts = dateRaw.split('/');
            if (parts.length === 3) {
                // Assuming DD/MM/YYYY
                formattedDate = `${parts[2]}-${parts[1]?.padStart(2, '0')}-${parts[0]?.padStart(2, '0')}`;
            }
        }

        return {
          id: crypto.randomUUID(),
          date: formattedDate,
          description,
          amount,
          type,
          category: tx.category || '',
          isSelected: true,
        };
      });

      setParsedTransactions(transactions);
      setStep('review');
    } catch (err) {
      console.error("Error parsing JSON:", err);
      setError("Failed to parse JSON file. Please ensure it is a valid JSON array of transactions.");
      setStep('error');
    } finally {
      setLoadingMessage('');
    }
  };

  const handleAnalyzeRequest = () => {
    if (!fullPdfText) {
      setError("PDF text not found. Please try re-uploading.");
      setStep('error');
      return;
    }
    
    let userQuery = 'Extract ';
    if (filterType === 'income') {
        userQuery += 'only income (credit) transactions';
    } else if (filterType === 'expense') {
        userQuery += 'only expense (debit) transactions';
    } else {
        userQuery += 'all income and expense transactions';
    }

    if (filterKeyword.trim()) {
        userQuery += ` where the description contains '${filterKeyword.trim()}'`;
    }
    userQuery += '.';

    setStep('parsing');
    extractTransactionsWithGemini(fullPdfText, userQuery);
  };
  
  const resetToUpload = (clearFile: boolean = true) => {
    if (clearFile) setFile(null);
    setParsedTransactions([]);
    setError(null);
    setStep('upload');
    setPdfTextPreview('');
    setFullPdfText('');
    setFilterType('all');
    setFilterKeyword('');
    setLoadingMessage('');
  };

  const extractTransactionsWithGemini = async (text: string, userQuery: string) => {
    setLoadingMessage('Analyzing PDF with AI...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an expert financial data extraction AI from bank statements.

**Primary Goal:** Extract transaction data into a JSON array based on the user's request.

**User's Request:** "${userQuery}"

**CRITICAL RULE: Date Extraction**
- You MUST extract the specific date for EACH transaction line from the document.
- DO NOT use a general "Statement Date" from the header. Every transaction has its own unique date on its own line.
- You MUST handle various date formats (e.g., \`DD-Mon-YYYY\`, \`DD/MM/YY\`) and ALWAYS convert them to the strict \`YYYY-MM-DD\` format in your JSON output.

**Output Format:**
- Return a clean JSON array of transaction objects that match the user's request.

Here is the text from the PDF:
\n\n ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: {
                  type: Type.STRING,
                  description: "The unique date for this specific transaction, found on its own row in the statement. CRITICAL: This MUST NOT be a general 'Statement Date' from the header. Find the date on the same line as the description. Parse formats like 'DD-Mon-YYYY' and STRICTLY convert to 'YYYY-MM-DD'.",
                },
                description: {
                  type: Type.STRING,
                  description: "A clean, concise description of the transaction.",
                },
                debit: {
                  type: Type.NUMBER,
                  description: "The debit amount (expense/withdrawal). Should be null if it's a credit.",
                  nullable: true,
                },
                credit: {
                  type: Type.NUMBER,
                  description: "The credit amount (income/deposit). Should be null if it's a debit.",
                  nullable: true,
                },
              },
              required: ["date", "description"],
            },
          },
        },
      });
      
      const jsonStr = response.text;
      if (!jsonStr) {
        throw new Error("AI returned an empty response.");
      }
      
      const data: GeminiTransaction[] = JSON.parse(jsonStr);

      const transactions: ParsedTransaction[] = data
        .filter(tx => (tx.debit !== null && tx.debit > 0) || (tx.credit !== null && tx.credit > 0))
        .map(tx => {
            const amount = tx.debit ?? tx.credit ?? 0;
            const type = tx.debit ? TransactionType.EXPENSE : TransactionType.INCOME;
            return {
                id: crypto.randomUUID(),
                date: tx.date,
                description: tx.description,
                amount: amount,
                type: type,
                category: '',
                isSelected: true,
            };
        })
        .sort((a, b) => b.date.localeCompare(a.date)); // Sort by date, most recent first

      if (transactions.length === 0) {
        setError("AI could not find any transactions matching your request in this PDF. It might be an image-based file, password-protected, or have an unusual format. Please try again or refine your request.");
        setStep('error');
      } else {
        setParsedTransactions(transactions);
        setStep('review');
      }

    } catch (err) {
      console.error("Error with Gemini extraction:", err);
      setError("AI analysis failed. The PDF format might be incompatible or the request could not be fulfilled. Please try again later.");
      setStep('error');
    } finally {
        setLoadingMessage('');
    }
  };


  const parsePdf = async (pdfFile: File) => {
    setStep('parsing');
    setLoadingMessage('Reading PDF file...');
    setError(null);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + '\n';
      }
      
      if (fullText.trim().length < 100) {
        throw new Error("This PDF contains little or no text. It might be a scanned image, which cannot be processed.");
      }

      setFullPdfText(fullText);
      setPdfTextPreview(fullText.substring(0, 2000) + (fullText.length > 2000 ? '...' : ''));
      setStep('preview');

    } catch (err: any) {
      console.error("Error parsing PDF:", err);
      let specificError = "Failed to parse PDF. The file may be corrupted or in an unsupported format.";
      if (err && err.message?.includes('scanned image')) { specificError = err.message; }
      else if (err && err.name === 'PasswordException') { specificError = "This PDF is password-protected and cannot be opened."; }
      else if (err && err.name === 'InvalidPDFException') { specificError = "The uploaded file is not a valid PDF or is corrupted."; }
      
      setError(specificError);
      setStep('error');
    } finally {
      setLoadingMessage('');
    }
  };
  
  const handleToggleSelect = (id: string) => {
    setParsedTransactions(prev => 
      prev.map(tx => tx.id === id ? { ...tx, isSelected: !tx.isSelected } : tx)
    );
  };
  
  const handleDeleteTransaction = (id: string) => {
    setParsedTransactions(prev => prev.filter(tx => tx.id !== id));
  };
  
  const handleUpdateTransaction = (id: string, field: keyof ParsedTransaction, value: string | TransactionType) => {
    setParsedTransactions(prev =>
      prev.map(tx => {
        if (tx.id === id) {
          let updatedValue: any = value;
          if (field === 'amount') {
            updatedValue = parseFloat(value as string) || 0;
          }
          const updatedTx = { ...tx, [field]: updatedValue };
          if (field === 'type' && tx.type !== value) {
            updatedTx.category = '';
          }
          return updatedTx;
        }
        return tx;
      })
    );
  };

  const handleImport = () => {
    if (!importAccountId) {
      setError("Please select an account to import the transactions into.");
      return;
    }
    const transactionsToImport = parsedTransactions
      .filter(tx => tx.isSelected)
      .map(tx => ({
        type: tx.type,
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        category: tx.category || (tx.type === TransactionType.INCOME ? 'Other Income' : 'Other'),
        accountId: importAccountId,
      } as IncomeExpenseTransactionDetails));
      
    if (transactionsToImport.length > 0) {
      onImportTransactions(transactionsToImport);
      resetToUpload(true);
    } else {
      setError("No transactions selected for import.");
      setStep('error');
    }
  };

  const summary = useMemo(() => {
    const selectedTxs = parsedTransactions.filter(tx => tx.isSelected);
    const income = selectedTxs.filter(tx => tx.type === TransactionType.INCOME).reduce((sum, tx) => sum + tx.amount, 0);
    const expense = selectedTxs.filter(tx => tx.type === TransactionType.EXPENSE).reduce((sum, tx) => sum + tx.amount, 0);
    return { count: selectedTxs.length, income, expense, net: income - expense };
  }, [parsedTransactions]);

  const inputClasses = "w-full px-2 py-1 bg-bg-primary-themed border border-border-primary rounded-md text-sm";
  
  const renderStepContent = () => {
    switch (step) {
      case 'upload':
      case 'preview':
        const extractionInputClasses = "mt-1 block w-full p-2 text-sm bg-bg-primary-themed border border-border-primary rounded-md";

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-6">
              <div>
                  <label htmlFor="pdf-upload" className="block text-sm font-medium text-text-muted-themed">1. Upload PDF, JSON, or CSV Statement</label>
                  <input
                      type="file" id="pdf-upload" accept="application/pdf, application/json, text/csv"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-text-muted-themed file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                  />
              </div>
              <div>
                  <label htmlFor="import-account" className="block text-sm font-medium text-text-muted-themed">2. Select Account to Import Into</label>
                  <select
                      id="import-account" value={importAccountId || ''} onChange={(e) => setImportAccountId(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 bg-bg-primary-themed border border-border-primary rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-text-base-themed ${!importAccountId ? 'border-red-500' : ''}`}
                  >
                      <option value="" disabled>-- Select an Account --</option>
                      {[...accounts].sort((a, b) => a.name.localeCompare(b.name)).map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
              </div>
            </div>
            {step === 'preview' && (
              <div className="mt-6 border-t border-border-secondary pt-4 animate-fade-in">
                <h3 className="text-lg font-semibold mb-2">3. Configure AI Extraction</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-muted-themed">PDF Text Preview:</label>
                  <textarea readOnly value={pdfTextPreview} className="mt-1 block w-full h-24 p-2 text-xs bg-bg-primary-themed border border-border-primary rounded-md" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-bg-primary-themed">
                    <div className="space-y-4">
                        <h4 className="font-medium">Filter Rows (What to extract)</h4>
                        <div>
                            <label className="block text-sm font-medium text-text-muted-themed">Transaction Type</label>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="filterType" value="all" checked={filterType === 'all'} onChange={e => setFilterType(e.target.value as any)} className="h-4 w-4 text-brand-primary focus:ring-brand-primary"/> All</label>
                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="filterType" value="income" checked={filterType === 'income'} onChange={e => setFilterType(e.target.value as any)} className="h-4 w-4 text-brand-primary focus:ring-brand-primary"/> Income Only</label>
                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="filterType" value="expense" checked={filterType === 'expense'} onChange={e => setFilterType(e.target.value as any)} className="h-4 w-4 text-brand-primary focus:ring-brand-primary"/> Expenses Only</label>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="filter-keyword" className="block text-sm font-medium text-text-muted-themed">Description Contains (Optional)</label>
                            <input id="filter-keyword" value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} className={extractionInputClasses} placeholder="e.g., amazon, upi"/>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-medium">Columns to Extract</h4>
                        <p className="text-xs text-text-muted-themed">The AI will always extract these required columns to create transactions.</p>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-text-muted-themed cursor-not-allowed"><input type="checkbox" checked disabled className="h-4 w-4 rounded text-slate-400 focus:ring-0"/>Date</label>
                            <label className="flex items-center gap-2 text-sm text-text-muted-themed cursor-not-allowed"><input type="checkbox" checked disabled className="h-4 w-4 rounded text-slate-400 focus:ring-0"/>Description</label>
                            <label className="flex items-center gap-2 text-sm text-text-muted-themed cursor-not-allowed"><input type="checkbox" checked disabled className="h-4 w-4 rounded text-slate-400 focus:ring-0"/>Debit/Credit Amount</label>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => resetToUpload(true)} className="px-4 py-2 text-sm font-medium rounded-lg" style={{backgroundColor: currentThemeColors.bgAccent}}>Cancel</button>
                    <button onClick={handleAnalyzeRequest} disabled={!importAccountId} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:opacity-50">Analyze with AI</button>
                </div>
              </div>
            )}
          </>
        );
      case 'parsing':
        return (
          <div className="text-center py-8 flex flex-col items-center">
            <div className="pdf-spinner mb-3"></div>
            <p className="text-text-muted-themed font-semibold">{loadingMessage}</p>
            <p className="text-text-muted-themed text-sm mt-2 animate-pulse">(This may take 10-30 seconds)</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center py-8 animate-fade-in">
            <div 
              className="p-4 mb-4 rounded-lg border flex items-start text-left" 
              style={{ 
                backgroundColor: `${currentThemeColors.expense}20`, 
                borderColor: `${currentThemeColors.expense}80`,
                color: currentThemeColors.expense
              }}
            >
              <AlertTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
              <div>
                <p className="font-bold">Import Failed</p>
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-2 opacity-80">
                  This can happen if the PDF is password-protected, corrupted, or a scanned image. Please ensure you are uploading a text-based statement.
                </p>
              </div>
            </div>
            <button onClick={() => resetToUpload(true)} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-lg shadow-md hover:opacity-90">
                Start Over
            </button>
          </div>
        );
      case 'review':
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">4. Review and Import Transactions</h3>
            <div className="overflow-x-auto max-h-[60vh] border rounded-lg" style={{ borderColor: currentThemeColors.borderSecondary }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-bg-accent-themed">
                  <tr>
                    <th className="p-2">
                      <input type="checkbox" checked={summary.count > 0 && summary.count === parsedTransactions.length} onChange={() => { const allSelected = summary.count === parsedTransactions.length; setParsedTransactions(p => p.map(tx => ({...tx, isSelected: !allSelected}))) }}/>
                    </th>
                    <th className="p-2 text-left">Date</th><th className="p-2 text-left">Description</th><th className="p-2 text-right">Amount</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Category</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedTransactions.map(tx => (
                    <tr key={tx.id} className="border-b" style={{ borderColor: currentThemeColors.borderSecondary }}>
                      <td className="p-2"><input type="checkbox" checked={tx.isSelected} onChange={() => handleToggleSelect(tx.id)} /></td>
                      <td className="p-2 whitespace-nowrap"><input type="date" value={tx.date} onChange={e => handleUpdateTransaction(tx.id, 'date', e.target.value)} className={`${inputClasses} dark:[color-scheme:dark]`} /></td>
                      <td className="p-2"><input type="text" value={tx.description} onChange={e => handleUpdateTransaction(tx.id, 'description', e.target.value)} className={inputClasses} /></td>
                      <td className="p-2 text-right"><input type="number" value={tx.amount} onChange={e => handleUpdateTransaction(tx.id, 'amount', e.target.value)} className={inputClasses} /></td>
                      <td className="p-2"><select value={tx.type} onChange={e => handleUpdateTransaction(tx.id, 'type', e.target.value as TransactionType)} className={inputClasses}><option value={TransactionType.EXPENSE}>Expense</option><option value={TransactionType.INCOME}>Income</option></select></td>
                      <td className="p-2"><select value={tx.category} onChange={e => handleUpdateTransaction(tx.id, 'category', e.target.value)} className={inputClasses}><option value="">-- Select --</option>{[...(tx.type === TransactionType.INCOME ? incomeCategories : expenseCategories)].sort((a, b) => a.localeCompare(b)).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></td>
                      <td className="p-2 text-center">
                          <button onClick={() => handleDeleteTransaction(tx.id)} className="text-expense hover:text-red-700">
                              <TrashIcon className="w-4 h-4" />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-bg-primary-themed rounded-lg border border-border-secondary">
                <h4 className="text-md font-semibold mb-2 text-text-base-themed">Summary of Selected Transactions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div><p className="text-sm text-text-muted-themed">Transactions</p><p className="text-lg font-bold text-text-base-themed">{summary.count}</p></div>
                    <div><p className="text-sm text-text-muted-themed">Total Income</p><p className="text-lg font-bold" style={{ color: currentThemeColors.income }}>{formatCurrency(summary.income)}</p></div>
                    <div><p className="text-sm text-text-muted-themed">Total Expense</p><p className="text-lg font-bold" style={{ color: currentThemeColors.expense }}>{formatCurrency(summary.expense)}</p></div>
                    <div><p className="text-sm text-text-muted-themed">Net Change</p><p className="text-lg font-bold" style={{ color: summary.net >= 0 ? currentThemeColors.income : currentThemeColors.expense }}>{formatCurrency(summary.net)}</p></div>
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => resetToUpload(true)} className="px-4 py-2 text-sm font-medium rounded-lg" style={{backgroundColor: currentThemeColors.bgAccent}}>Cancel & Start Over</button>
                <button onClick={handleImport} disabled={summary.count === 0 || !importAccountId} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:opacity-50">Import {summary.count} Selected</button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="bg-bg-secondary-themed p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-text-base-themed flex items-center mb-4">
        <SparklesIcon className="w-6 h-6 mr-2 text-brand-primary" />
        Import Transactions with AI
      </h2>
      <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm">
        <strong>Note:</strong> AI parsing can be inaccurate. Please carefully review all extracted transactions before importing.
      </div>
      {renderStepContent()}
      <style>{`
        .pdf-spinner {
            width: 32px; height: 32px; border: 4px solid ${currentThemeColors.bgAccent};
            border-top: 4px solid ${currentThemeColors.brandPrimary};
            border-radius: 50%; animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default PdfImporter;
