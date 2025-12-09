import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { useMemo } from 'react';

interface MessageRendererProps {
  content: string;
  isUser?: boolean;
}

const CHART_COLORS = [
  'hsl(350, 100%, 38%)', // cardinal red
  'hsl(350, 80%, 50%)',
  'hsl(350, 60%, 60%)',
  'hsl(0, 0%, 70%)',
  'hsl(200, 70%, 50%)',
  'hsl(150, 60%, 45%)',
];

// Extract JSON data blocks for charts
const extractChartData = (content: string) => {
  const chartMatches: Array<{ type: string; data: any[]; title?: string }> = [];
  
  // Look for ```chart patterns
  const chartRegex = /```chart:(bar|line|pie|area)\s*(.*?)\n([\s\S]*?)```/g;
  let match;
  
  while ((match = chartRegex.exec(content)) !== null) {
    try {
      const chartType = match[1];
      const title = match[2].trim();
      const jsonData = JSON.parse(match[3]);
      chartMatches.push({ type: chartType, data: jsonData, title });
    } catch (e) {
      // Invalid JSON, skip
    }
  }
  
  return chartMatches;
};

// Extract metrics/stats blocks
const extractMetrics = (content: string) => {
  const metricsRegex = /```metrics\n([\s\S]*?)```/g;
  const metrics: Array<{ label: string; value: string; change?: string }> = [];
  
  let match;
  while ((match = metricsRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        metrics.push(...parsed);
      }
    } catch (e) {
      // Invalid JSON
    }
  }
  
  return metrics;
};

const ChartRenderer = ({ type, data, title }: { type: string; data: any[]; title?: string }) => {
  if (!data || data.length === 0) return null;
  
  const keys = Object.keys(data[0]).filter(k => k !== 'name' && k !== 'label');
  
  return (
    <div className="my-4 p-4 bg-background/50 rounded-xl border border-border/50">
      {title && <h4 className="font-display text-lg font-semibold mb-4 text-cardinal-red">{title}</h4>}
      <ResponsiveContainer width="100%" height={250}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 25%)" />
            <XAxis dataKey="name" stroke="hsl(0, 0%, 65%)" fontSize={12} />
            <YAxis stroke="hsl(0, 0%, 65%)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(240, 10%, 12%)', 
                border: '1px solid hsl(240, 10%, 20%)',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            {keys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 25%)" />
            <XAxis dataKey="name" stroke="hsl(0, 0%, 65%)" fontSize={12} />
            <YAxis stroke="hsl(0, 0%, 65%)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(240, 10%, 12%)', 
                border: '1px solid hsl(240, 10%, 20%)',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            {keys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ fill: CHART_COLORS[i % CHART_COLORS.length] }} />
            ))}
          </LineChart>
        ) : type === 'area' ? (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 25%)" />
            <XAxis dataKey="name" stroke="hsl(0, 0%, 65%)" fontSize={12} />
            <YAxis stroke="hsl(0, 0%, 65%)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(240, 10%, 12%)', 
                border: '1px solid hsl(240, 10%, 20%)',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            {keys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.3} />
            ))}
          </AreaChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(240, 10%, 12%)', 
                border: '1px solid hsl(240, 10%, 20%)',
                borderRadius: '8px'
              }} 
            />
            <Legend />
          </PieChart>
        ) : null}
      </ResponsiveContainer>
    </div>
  );
};

const MetricsRenderer = ({ metrics }: { metrics: Array<{ label: string; value: string; change?: string }> }) => {
  if (metrics.length === 0) return null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
      {metrics.map((metric, i) => (
        <div key={i} className="bg-background/50 p-4 rounded-xl border border-border/50 text-center">
          <p className="text-2xl font-display font-bold text-cardinal-red">{metric.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
          {metric.change && (
            <p className={`text-xs mt-1 ${metric.change.startsWith('+') ? 'text-green-500' : 'text-red-400'}`}>
              {metric.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export const MessageRenderer = ({ content, isUser }: MessageRendererProps) => {
  const charts = useMemo(() => extractChartData(content), [content]);
  const metrics = useMemo(() => extractMetrics(content), [content]);
  
  // Remove chart and metrics blocks from content for markdown rendering
  const cleanedContent = useMemo(() => {
    let cleaned = content;
    cleaned = cleaned.replace(/```chart:(bar|line|pie|area)\s*.*?\n[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/```metrics\n[\s\S]*?```/g, '');
    return cleaned.trim();
  }, [content]);

  if (isUser) {
    return <p className="text-sm leading-relaxed">{content}</p>;
  }

  return (
    <div className="message-content">
      {/* Render metrics first */}
      {metrics.length > 0 && <MetricsRenderer metrics={metrics} />}
      
      {/* Render markdown content */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-display font-bold text-cardinal-red mt-6 mb-3">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-display font-semibold text-cardinal-red mt-5 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-display font-semibold text-foreground mt-4 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed mb-3 text-foreground/90">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-none space-y-2 mb-4 ml-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 ml-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-foreground/90 flex items-start gap-2">
              <span className="text-cardinal-red mt-1">•</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">{children}</em>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs text-cardinal-red font-mono">
                {children}
              </code>
            ) : (
              <code className="block bg-background/50 p-4 rounded-lg text-xs font-mono overflow-x-auto mb-4 border border-border/50">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-background/50 p-4 rounded-lg text-xs font-mono overflow-x-auto mb-4 border border-border/50">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-cardinal-red pl-4 py-2 my-4 bg-background/30 rounded-r-lg italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-cardinal-red/20">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border/50">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-background/30 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-foreground">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-muted-foreground">{children}</td>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-cardinal-red hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-6 border-border/50" />
          ),
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
      
      {/* Render charts */}
      {charts.map((chart, i) => (
        <ChartRenderer key={i} type={chart.type} data={chart.data} title={chart.title} />
      ))}
    </div>
  );
};
