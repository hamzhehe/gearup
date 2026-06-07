import pathlib

p = pathlib.Path(__file__).resolve().parents[1] / "src/app/manufacturer/analytics/page.js"
t = p.read_text(encoding="utf-8")

old_block = (
    "                </div>\n"
    "            </div>\n"
    "        );\n"
    "    }\n"
    "\n"
    "    return (\n"
    '        <motionless className="space-y-10 w-full animate-in fade-in duration-300">'
).replace("motionless", "motionless")

new_block = (
    "                </div>\n"
    "            </PageShell>\n"
    "        );\n"
    "    }\n"
    "\n"
    "    return (\n"
    "        <PageShell>"
)

# Build with actual div tag
d = "d" + "iv"
old_block = old_block.replace("motionless", d)
t = t.replace(old_block, new_block)

footer_old = "            </div>\n        </div>\n    );\n}"
footer_new = "            </motionless>\n        </PageShell>\n    );\n}".replace("motionless", d)
if t.endswith(footer_old) or footer_old in t:
    t = t.replace(footer_old, footer_new)

p.write_text(t, encoding="utf-8")
print("PageShell count:", t.count("PageShell"))
