"""UI consistency patches — logic unchanged."""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1] / "src"

IMPORT_SHELL = (
    "import PageShell from '@/components/dashboard/PageShell';\n"
    "import PageHeader from '@/components/dashboard/PageHeader';\n"
)

def add_imports(content, after='import Skeleton'):
    if 'PageShell' in content:
        return content
    if after in content:
        return content.replace(after, IMPORT_SHELL + after, 1)
    return content

def patch_file(rel, replacements, import_after=None):
    p = ROOT / "app" / rel
    if not p.exists():
        print("missing", rel)
        return
    t = p.read_text(encoding="utf-8")
    if import_after:
        t = add_imports(t, import_after)
    for old, new in replacements:
        if old in t:
            t = t.replace(old, new)
    p.write_text(t, encoding="utf-8")
    print("ok", rel)

# Orders: spacing + processing badge color
patch_file(
    "manufacturer/orders/page.js",
    [
        ('className="space-y-8 max-w-full pb-10 animate-in fade-in duration-300"',
         'className="space-y-6 w-full animate-in fade-in duration-300"'),
        ('className="space-y-8 max-w-full pb-10"',
         'className="space-y-6 w-full"'),
        ("processing: { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: RefreshCw }",
         "processing: { color: 'text-orange-600 bg-orange-50 border-orange-100', icon: RefreshCw }"),
        ('className="desktop-only bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"',
         'className="desktop-only bg-white rounded-2xl border border-[#E7ECF3] shadow-[0_2px_15px_rgba(0,0,0,0.01)] overflow-hidden"'),
        ('className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm space-y-4"',
         'className="bg-white rounded-2xl border border-[#E7ECF3] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.01)] space-y-4"'),
    ],
    "import StatCard",
)

# Products
patch_file(
    "manufacturer/products/page.js",
    [
        ('className="space-y-10 animate-in fade-in duration-300"', 'className="space-y-6 w-full animate-in fade-in duration-300"'),
        ('className="space-y-10"', 'className="space-y-6 w-full"'),
        ('rounded-[2rem] border border-slate-100', 'rounded-2xl border border-[#E7ECF3]'),
        ('rounded-[2.5rem] border border-slate-100', 'rounded-2xl border border-[#E7ECF3]'),
        ('rounded-[3rem] border border-slate-100', 'rounded-2xl border border-[#E7ECF3]'),
        ('shadow-xl shadow-slate-200/50', 'shadow-[0_2px_15px_rgba(0,0,0,0.01)]'),
    ],
    "import Card",
)

# Transactions + reports anchor
p = ROOT / "app/manufacturer/transactions/page.js"
t = p.read_text(encoding="utf-8")
t = add_imports(t, "import Card")
t = t.replace('className="space-y-10 animate-in fade-in duration-300"', 'className="space-y-6 w-full animate-in fade-in duration-300"')
t = t.replace('className="space-y-10"', 'className="space-y-6 w-full"')
t = t.replace('rounded-[3rem] border border-slate-100', 'rounded-2xl border border-[#E7ECF3]')
t = t.replace('rounded-[2rem] border border-slate-100', 'rounded-2xl border border-[#E7ECF3]')
t = t.replace('shadow-xl shadow-slate-200/50', 'shadow-[0_2px_15px_rgba(0,0,0,0.01)]')
if 'id="reports"' not in t:
    reports_block = '''

            {/* Reports — financial summary (sidebar anchor) */}
            <section id="reports" className="scroll-mt-28 space-y-6">
                <div>
                    <h2 className="font-heading text-2xl font-black text-slate-900 tracking-tight">Reports</h2>
                    <p className="font-body text-slate-500 font-medium text-sm mt-1">Export-ready payment and settlement summaries</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-[#E7ECF3] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
                        <p className="font-body text-[9px] font-black uppercase tracking-widest text-slate-400">Completed settlements</p>
                        <p className="font-heading text-2xl font-black text-slate-900 mt-2">PKR {totalRevenue.toLocaleString()}</p>
                    </div>
                    <motionless className="bg-white rounded-2xl border border-[#E7ECF3] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
                        <p className="font-body text-[9px] font-black uppercase tracking-widest text-slate-400">Pending in transit</p>
                        <p className="font-heading text-2xl font-black text-amber-600 mt-2">PKR {pendingAmount.toLocaleString()}</p>
                    </motionless>
                    <motionless className="bg-white rounded-2xl border border-[#E7ECF3] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
                        <p className="font-body text-[9px] font-black uppercase tracking-widest text-slate-400">Total records</p>
                        <p className="font-heading text-2xl font-black text-slate-900 mt-2">{transactions.length}</p>
                    </motionless>
                </motionless>
            </section>
'''
    reports_block = reports_block.replace("motionless", "d" + "iv")
    insert_before = "            {/* Payout History Section */}"
    if insert_before in t:
        t = t.replace(insert_before, reports_block + "\n" + insert_before)
p.write_text(t, encoding="utf-8")
print("ok transactions")

# Chats
patch_file(
    "manufacturer/chats/page.js",
    [
        ('className="max-w-6xl mx-auto px-4 mt-6 pb-12 font-body text-slate-800 animate-in fade-in duration-300"',
         'className="space-y-6 w-full animate-in fade-in duration-300"'),
        ('className="max-w-6xl mx-auto px-4 mt-6 pb-12 font-body text-slate-800"',
         'className="space-y-6 w-full"'),
        ('className="bg-white rounded-3xl border border-slate-100 shadow-sm',
         'className="bg-white rounded-2xl border border-[#E7ECF3] shadow-[0_2px_15px_rgba(0,0,0,0.01)]'),
        ('font-heading text-3xl font-black', 'font-heading text-4xl font-black tracking-tighter'),
    ],
    "import Skeleton",
)

# Wholesaler pages spacing
for rel in ["wholesaler/marketplace/page.js", "wholesaler/cart/page.js", "wholesaler/orders/page.js"]:
    p = ROOT / "app" / rel
    if not p.exists():
        continue
    t = p.read_text(encoding="utf-8")
    t = add_imports(t, "import { useAuth")
    t = re.sub(r'className="space-y-\d+', 'className="space-y-6', t, count=3)
    t = t.replace("border-slate-100 shadow-xl", "border-[#E7ECF3] shadow-[0_2px_15px_rgba(0,0,0,0.01)]")
    t = t.replace("rounded-[2.5rem]", "rounded-2xl").replace("rounded-[3rem]", "rounded-2xl").replace("rounded-[2rem]", "rounded-2xl")
    p.write_text(t, encoding="utf-8")
    print("ok", rel)

print("done")
