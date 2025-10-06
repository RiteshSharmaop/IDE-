const FileIcon = ({ language, size = 'normal' }) => {
  const iconMap = {
    javascript: { color: '#F7DF1E', text: 'JS' },
    python: { color: '#3776AB', text: 'PY' },
    cpp: { color: '#00599C', text: 'C++' },
    c: { color: '#A8B9CC', text: 'C' },
    java: { color: '#007396', text: 'JAVA' },
    csharp: { color: '#239120', text: 'C#' },
    json: { color: '#D0D0D0', text: 'JSON' },
    markdown: { color: '#D0D0D0', text: 'MD' }
  };
  
  const config = iconMap[language] || { color: '#D0D0D0', text: 'FILE' };
  const sizeClass = size === 'small' ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]';
  
  return (
    <div 
      className={`${sizeClass} rounded flex items-center justify-center font-bold`}
      style={{ backgroundColor: config.color + '20', color: config.color, border: `1px solid ${config.color}` }}
    >
      {config.text}
    </div>
  );
};

export {FileIcon}
