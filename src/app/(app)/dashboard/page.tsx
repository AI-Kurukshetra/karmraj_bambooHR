import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const userId = data.user?.id ?? null;
  const { data: memberships } = userId
    ? await supabase
        .from("organization_members")
        .select("org_id,is_primary")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .limit(5)
    : { data: null };
  const hasOrg = (memberships ?? []).length > 0;

  const [{ count: totalEmployees }, { count: activeEmployees }, { count: inactiveEmployees }] =
    await Promise.all([
      supabase
        .from("employees")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null),
      supabase
        .from("employees")
        .select("id", { count: "exact", head: true })
        .eq("employment_status", "active")
        .is("deleted_at", null),
      supabase
        .from("employees")
        .select("id", { count: "exact", head: true })
        .neq("employment_status", "active")
        .is("deleted_at", null),
    ]);

  const { data: headcountRows } = await supabase.rpc(
    "report_headcount_by_department",
  );

  const { data: activeInactiveRows } = await supabase.rpc(
    "report_active_vs_inactive",
  );
  const activeInactive = activeInactiveRows?.[0] ?? {
    active_count: 0,
    inactive_count: 0,
  };

  const [{ count: pendingLeaves }, { count: approvedLeaves }, { count: rejectedLeaves }] =
    await Promise.all([
      supabase
        .from("leave_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .is("deleted_at", null),
      supabase
        .from("leave_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved")
        .is("deleted_at", null),
      supabase
        .from("leave_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "rejected")
        .is("deleted_at", null),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Operational overview (RLS enforced). Signed in as{" "}
            <span className="font-medium">{data.user?.email}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/employees"
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
          >
            View employees
          </Link>
          <Link
            href="/reports"
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-900"
          >
            Reports
          </Link>
        </div>
      </div>

      {!hasOrg ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 text-sm text-amber-200">
          No organization is linked to your user yet. Run{" "}
          <Link className="underline" href="/setup">
            initial setup
          </Link>{" "}
          to create one and seed roles/permissions.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Employees"
          value={(totalEmployees ?? 0).toLocaleString()}
          hint={`${(activeEmployees ?? 0).toLocaleString()} active`}
        />
        <KpiCard
          title="Inactive"
          value={(inactiveEmployees ?? 0).toLocaleString()}
          hint="Soft-deletes excluded"
        />
        <KpiCard
          title="Leave pending"
          value={(pendingLeaves ?? 0).toLocaleString()}
          hint="Approval queue"
        />
        <KpiCard
          title="Exports"
          value="CSV"
          hint="Permission-gated"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Headcount by department" subtitle="Counts are RLS-filtered.">
          <BarChart
            data={(headcountRows ?? []).map((r) => ({
              label: r.department_name,
              value: Number(r.headcount ?? 0),
            }))}
          />
        </Panel>
        <Panel title="Active vs inactive" subtitle="Workforce status snapshot.">
          <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
            <DonutChart
              segments={[
                { label: "Active", value: Number(activeInactive.active_count ?? 0), color: "#0B3A73" },
                { label: "Inactive", value: Number(activeInactive.inactive_count ?? 0), color: "#5EEAD4" },
              ]}
            />
            <div className="space-y-2 text-sm">
              <LegendItem label="Active" color="#0B3A73" value={Number(activeInactive.active_count ?? 0)} />
              <LegendItem label="Inactive" color="#5EEAD4" value={Number(activeInactive.inactive_count ?? 0)} />
              <div className="pt-3 text-xs text-zinc-500">
                Tip: compensation is restricted by separate policies.
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Leave status" subtitle="Requests by state (all time).">
        <div className="grid gap-3 md:grid-cols-3">
          <MiniStat title="Pending" value={pendingLeaves ?? 0} />
          <MiniStat title="Approved" value={approvedLeaves ?? 0} />
          <MiniStat title="Rejected" value={rejectedLeaves ?? 0} />
        </div>
      </Panel>
    </div>
  );
}

function KpiCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] motion-safe:animate-[fade-up_500ms_ease-out_both]">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-zinc-400">{hint}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] motion-safe:animate-[fade-up_550ms_ease-out_both]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-zinc-400">{subtitle}</div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MiniStat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {title}
      </div>
      <div className="mt-1 text-xl font-semibold tracking-tight">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function LegendItem({
  label,
  color,
  value,
}: {
  label: string;
  color: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-zinc-200">{label}</span>
      </div>
      <div className="font-medium text-zinc-50">{value.toLocaleString()}</div>
    </div>
  );
}

function BarChart({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const width = 560;
  const height = 220;
  const padding = 28;
  const barGap = 10;
  const barCount = Math.max(1, data.length);
  const barWidth = Math.max(10, (width - padding * 2 - barGap * (barCount - 1)) / barCount);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[220px] min-w-[560px]"
        role="img"
        aria-label="Headcount by department"
      >
        <rect x="0" y="0" width={width} height={height} fill="#09090B" />
        {/* baseline */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#27272A"
        />

        {data.map((d, i) => {
          const barH = Math.round(((height - padding * 2) * d.value) / max);
          const x = padding + i * (barWidth + barGap);
          const y = height - padding - barH;
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="10"
                fill="#0B3A73"
                opacity="0.92"
              />
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#A1A1AA"
              >
                {truncate(d.label, 10)}
              </text>
              <text
                x={x + barWidth / 2}
                y={Math.max(14, y - 6)}
                textAnchor="middle"
                fontSize="10"
                fill="#E4E4E7"
              >
                {d.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DonutChart({
  segments,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  const total = Math.max(
    1,
    segments.reduce((sum, s) => sum + (Number.isFinite(s.value) ? s.value : 0), 0),
  );
  const size = 160;
  const r = 58;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;

  let acc = 0;
  const strokes = segments.map((s) => {
    const v = Math.max(0, s.value);
    const frac = v / total;
    const dash = frac * c;
    const gap = c - dash;
    const offset = c * (1 - acc);
    acc += frac;
    return { ...s, dash, gap, offset };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Active vs inactive"
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#27272A"
        strokeWidth="14"
      />
      {strokes.map((s) => (
        <circle
          key={s.label}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="14"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={s.offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fontSize="14"
        fill="#E4E4E7"
        fontWeight="600"
      >
        {Math.round((segments[0]?.value ?? 0) * 100 / total)}% active
      </text>
    </svg>
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

