import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1] / "src" / "app"

def patch_analytics():
    p = ROOT / "manufacturer" / "analytics" / "page.js"
    t = p.read_text(encoding="utf-8")
    t = t.replace(
        "            </motionless>\n        );\n    }\n\n    return (\n        <motionless className=\"space-y-10 w-full animate-in fade-in duration-300\">",
        "            </PageShell>\n        );\n    }\n\n    return (\n        <PageShell>",
    )
    t = t.replace("mot" + "ionless className=\"space-y-10 w-full animate-in fade-in duration-300\"", "PageShell")
    # Fix loading close: PageShell opened but closed with div
    t = re.sub(
        r"(<Skeleton variant=\"table\" rows=\{6\} />\s*</motionless>\s*)</motionless>(\s*\);\s*}\s*\n\s*return)",
        r"\1</PageShell>\2",
        t,
        count=1,
    )
    t = t.replace("mot" + "ionless", "div")
    t = t.replace("</motionless>", "</motionless>")
    # fix erroneous double replace - use explicit
    t = t.replace("</motionless>", "</motionless>")
    p.write_text(t, encoding="utf-8")
    print("analytics patched")

def simple_space_replace(path, old_space="space-y-10", use_pageshell=True):
    p = ROOT / path
    if not p.exists():
        print("skip", path)
        return
    t = p.read_text(encoding="utf-8")
    if "PageShell" not in t and use_pageshell:
        t = t.replace(
            'import Skeleton from',
            "import PageShell from '@/components/dashboard/PageShell';\nimport PageHeader from '@/components/dashboard/PageHeader';\nimport Skeleton from",
            1,
        )
    t = t.replace(f'className="{old_space}', 'className="space-y-6')
    t = t.replace(f"className='{old_space}", "className='space-y-6")
    p.write_text(t, encoding="utf-8")
    print("patched spacing", path)

# Run analytics fix properly
p = ROOT / "manufacturer" / "analytics" / "page.js"
t = p.read_text(encoding="utf-8")
# Close loading PageShell
t = t.replace(
    """                <motionless className="w-full">
                    <Skeleton variant="table" rows={6} />
                </motionless>
            </motionless>""".replace("motionless", "div"),
    """                <motionless className="w-full">
                    <Skeleton variant="table" rows={6} />
                </motionless>
            </PageShell>""".replace("motionless", "motionless"),
)
# Actually use div in python source
loading_close_old = (
    '                <div className="w-full">\n'
    '                    <Skeleton variant="table" rows={6} />\n'
    '                </div>\n'
    '            </motionless>'
).replace("motionless", "motionless")
loading_close_new = loading_close_old.replace("motionless", "PageShell")
t = t.replace(loading_close_old, loading_close_new)

return_open_old = '<div className="space-y-10 w-full animate-in fade-in duration-300">'
return_open_new = '<PageShell>'
if return_open_old in t:
    t = t.replace(return_open_old, return_open_new, 1)

# Close main return - last </div> before );
if t.rstrip().endswith("    );\n}"):
    t = t.rstrip()
    if t.endswith("</PageShell>\n    );\n}"):
        pass
    elif t.endswith("</motionless>\n        </motionless>\n    );\n}"):
        t = t[:-len("</motionless>\n        </motionless>\n    );\n}")] + "        </PageShell>\n    );\n}"
    elif t.endswith("</motionless>\n    );\n}"):
        t = t[:-len("</motionless>\n    );\n}")] + "    );\n}"

p.write_text(t, encoding="utf-8")
print("analytics", "PageShell" in t, t.count("PageShell"))

for rel in [
    "manufacturer/orders/page.js",
    "manufacturer/products/page.js",
    "manufacturer/transactions/page.js",
    "manufacturer/chats/page.js",
]:
    simple_space_replace(rel, "space-y-8" if "orders" in rel else "space-y-10")
