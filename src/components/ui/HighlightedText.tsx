interface Props {
  parts: { text: string; match: boolean }[];
}

export function HighlightedText({ parts }: Props) {
  return (
    <>
      {parts.map((part, index) =>
        part.match ? (
          <mark key={index} className="rounded-sm bg-accent/25 px-0.5 text-accent-strong">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}
