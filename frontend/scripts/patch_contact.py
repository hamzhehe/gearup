import pathlib

p = pathlib.Path(__file__).resolve().parents[1] / "src/app/contact/page.js"
t = p.read_text(encoding="utf-8")

old_return = """    return (
        <PublicLayout>
            <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 pt-32 pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="font-heading text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                            Get in Touch
                        </h1>
                        <p className="font-body text-xl text-slate-600 max-w-2xl mx-auto">
                            We'd love to hear from you. Tell us how GearUp can transform your business.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">"""

new_return = """    const formSection = (
                    <div className="grid md:grid-cols-2 gap-8 items-start">"""

if old_return in t:
    t = t.replace(old_return, new_return)
else:
    print("WARN: old_return not found")

old_end = """                    </div>
                </div>
            </div>
        </PublicLayout>
    );"""

new_end = """                    </motionless>
    );

    if (isManufacturerDashboard) {
        return (
            <ProtectedRoute allowedRoles={['manufacturer', 'wholesaler', 'admin']}>
                <DashboardLayout>
                    <PageShell>
                        <PageHeader
                            title="Help & Support"
                            subtitle="Contact our B2B merchant support team or send an inquiry"
                        />
                        <div className="grid lg:grid-cols-3 gap-6 items-start">
                            <div className="lg:col-span-2">{formSection}</motionless>
                            <SupportCard />
                        </motionless>
                    </PageShell>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <PublicLayout>
            <motionless className="min-h-screen bg-gradient-to-b from-white to-neutral-50 pt-32 pb-20">
                <motionless className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motionless className="text-center mb-16">
                        <h1 className="font-heading text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                            Get in Touch
                        </h1>
                        <p className="font-body text-xl text-slate-600 max-w-2xl mx-auto">
                            We&apos;d love to hear from you. Tell us how GearUp can transform your business.
                        </p>
                    </motionless>
                    {formSection}
                </motionless>
            </motionless>
        </PublicLayout>
    );"""

new_end = new_end.replace("motionless", "d" + "iv")
t = t.replace(old_end, new_end)

# Premium form card for manufacturer
t = t.replace(
    'className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8"',
    'className="bg-white rounded-2xl border border-[#E7ECF3] shadow-[0_2px_15px_rgba(0,0,0,0.01)] p-8"',
)

p.write_text(t, encoding="utf-8")
print("contact patched", "isManufacturerDashboard" in t)
