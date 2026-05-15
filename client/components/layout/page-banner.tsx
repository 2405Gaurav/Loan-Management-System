type Props = {
  label?: string;
  title: string;
  description?: string;
};

export function PageBanner({ label, title, description }: Props) {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-slate-100 to-white px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {label && (
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
