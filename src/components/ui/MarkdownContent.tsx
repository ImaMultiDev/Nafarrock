"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className = "" }: Props) {
  return (
    <div
      className={`prose prose-invert max-w-none ${className}`}
      style={{
        // Estilo punk para el markdown
        ["--tw-prose-body" as string]: "#e5e5e5",
        ["--tw-prose-headings" as string]: "#f8f8f8",
        ["--tw-prose-links" as string]: "#E60026",
        ["--tw-prose-bold" as string]: "#f8f8f8",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-display text-3xl tracking-tighter text-punk-white mt-8 mb-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-display text-xl tracking-tighter text-punk-red mt-8 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-lg tracking-tighter text-punk-green mt-6 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="font-body text-punk-white/90 leading-relaxed mb-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-none space-y-2 mb-4">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="flex gap-2 font-body text-punk-white/90">
              <span className="text-punk-red font-display">—</span>
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="text-punk-white font-semibold">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-punk-red hover:underline"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse border border-punk-white/20">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-punk-red/20">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-punk-white/20 px-4 py-2 text-left font-punch text-xs uppercase tracking-widest text-punk-red">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-punk-white/20 px-4 py-2 font-body text-punk-white/90">
              {children}
            </td>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-punk-white/10">{children}</tr>
          ),
          hr: () => <hr className="border-punk-white/20 my-8" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
