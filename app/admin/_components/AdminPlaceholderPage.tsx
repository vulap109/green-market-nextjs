type AdminPlaceholderPageProps = Readonly<{
  description: string;
  tasks: string[];
  title: string;
}>;

export default function AdminPlaceholderPage({
  description,
  tasks,
  title
}: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-bold text-slate-950">Việc cần triển khai</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <div key={task} className="flex items-center gap-3 px-5 py-4 text-sm text-slate-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <i className="fa-solid fa-circle-dot text-[9px]" aria-hidden="true" />
              </span>
              <span>{task}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
