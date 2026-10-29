const URL_PATTERN = /(https?:\/\/[^\s|]*[^\s|.,;:)!?])/g;

export function LinkifiedText({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="break-all font-medium underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
          >
            {part.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}
            {part.replace(/^https?:\/\/(www\.)?/, "").length > 40 ? "…" : ""}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}
