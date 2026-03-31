import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ShareIcon } from './Icons';

interface EntityBoxProps {
  title: string;
  attributes: { name: string; type: 'PK' | 'FK' | '' }[];
  position: { top: number; left: number };
  id: string;
}

const EntityBox: React.FC<EntityBoxProps> = ({ title, attributes, position, id }) => {
    const { currentThemeColors } = useTheme();

    return (
        <div 
            id={id}
            className="absolute p-3 rounded-lg shadow-lg border-2 w-48 text-xs" 
            style={{ 
                top: `${position.top}px`, 
                left: `${position.left}px`,
                backgroundColor: currentThemeColors.bgPrimary,
                borderColor: currentThemeColors.brandSecondary
            }}
        >
            <h4 className="font-bold text-center border-b pb-1 mb-1" style={{ color: currentThemeColors.brandSecondary, borderColor: currentThemeColors.borderSecondary }}>
                {title}
            </h4>
            <ul>
                {attributes.map(attr => (
                    <li key={attr.name} className="flex justify-between py-0.5">
                        <span>{attr.name}</span>
                        <span className="font-mono text-text-muted-themed">{attr.type}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const ERDiagram: React.FC = () => {
    const { currentThemeColors } = useTheme();

    const entities: Omit<EntityBoxProps, 'id'>[] = [
        {
            title: "User",
            attributes: [{ name: "id", type: "PK" }, { name: "username", type: "" }, { name: "role", type: "" }],
            position: { top: 150, left: 40 }
        },
        {
            title: "Account",
            attributes: [{ name: "id", type: "PK" }, { name: "name", type: "" }, { name: "userId", type: "FK" }],
            position: { top: 150, left: 300 }
        },
        {
            title: "Transaction",
            attributes: [{ name: "id", type: "PK" }, { name: "accountId", type: "FK" }, { name: "amount", type: "" }, {name: "transferId", type: ""}],
            position: { top: 40, left: 560 }
        },
        {
            title: "BudgetSetting",
            attributes: [{ name: "accountId", type: "FK" }, { name: "category", type: "PK" }, { name: "periodIdentifier", type: "PK" }],
            position: { top: 260, left: 560 }
        },
        {
            title: "TodoItem",
            attributes: [{ name: "id", type: "PK" }, { name: "text", type: "" }, { name: "completed", type: "" }],
            position: { top: 450, left: 40 }
        },
        {
            title: "DayPlannerEntry",
            attributes: [{ name: "id", type: "PK" }, { name: "title", type: "" }, { name: "date", type: "" }],
            position: { top: 450, left: 300 }
        },
    ];
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-text-base-themed mb-4 flex items-center">
                <ShareIcon className="w-5 h-5 mr-2 text-brand-secondary" />
                Data Schema (Simplified ER Diagram)
            </h3>
            <div className="relative w-full h-[600px] bg-bg-primary-themed rounded-lg overflow-auto border" style={{ borderColor: currentThemeColors.borderSecondary }}>
                <div className="relative w-[800px] h-[600px]">
                    {entities.map(e => <EntityBox key={e.title} id={`entity-${e.title}`} {...e} />)}

                    <svg width="800" height="600" className="absolute top-0 left-0 pointer-events-none">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill={currentThemeColors.textMuted} />
                            </marker>
                        </defs>
                        {/* User -> Account */}
                        <line x1="232" y1="195" x2="300" y2="195" stroke={currentThemeColors.textMuted} strokeWidth="2" markerEnd="url(#arrowhead)"/>
                        <text x="250" y="185" fill={currentThemeColors.textMuted} fontSize="12">1 - M</text>
                        
                        {/* Account -> Transaction */}
                        <line x1="492" y1="180" x2="560" y2="100" stroke={currentThemeColors.textMuted} strokeWidth="2" markerEnd="url(#arrowhead)"/>
                        <text x="510" y="130" fill={currentThemeColors.textMuted} fontSize="12">1 - M</text>

                        {/* Account -> BudgetSetting */}
                        <line x1="492" y1="220" x2="560" y2="300" stroke={currentThemeColors.textMuted} strokeWidth="2" markerEnd="url(#arrowhead)"/>
                        <text x="510" y="270" fill={currentThemeColors.textMuted} fontSize="12">1 - M</text>
                    </svg>

                    <div className="absolute bottom-2 right-2 text-xs p-2 rounded" style={{backgroundColor: currentThemeColors.bgSecondary}}>
                        <p><span className="font-mono font-bold">PK</span>: Primary Key</p>
                        <p><span className="font-mono font-bold">FK</span>: Foreign Key</p>
                        <p className="mt-1 text-text-muted-themed">Note: This is a simplified diagram of major entities.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ERDiagram;
