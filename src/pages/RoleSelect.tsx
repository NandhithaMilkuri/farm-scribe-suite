import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { Shield, Users, Sprout } from "lucide-react";
import { motion } from "framer-motion";
import nutrantaLogo from "@/assets/nutranta-logo.png";

const roles = [
  {
    id: "operator",
    title: "Operator",
    description: "Manage villages, supervisors, crop approvals & salary",
    icon: Shield,
    gradient: "from-accent to-accent/80",
  },
  {
    id: "supervisor",
    title: "Supervisor",
    description: "Track attendance, crop yield, travel bills & reports",
    icon: Users,
    gradient: "from-primary to-gold-glow",
  },
  {
    id: "organizer",
    title: "Organizer",
    description: "Handle farmer payments, commissions & field operations",
    icon: Sprout,
    gradient: "from-accent/90 to-accent/60",
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (user) return <Navigate to={`/${user.role}`} replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <img src={nutrantaLogo} alt="Nutranta" className="h-20 w-auto" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Nutranta Field Operations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              The Symbol of Quality — Agriculture Management System
            </p>
          </div>
        </motion.div>
      </header>

      {/* Role Cards */}
      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-3xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm font-medium text-muted-foreground mb-6"
          >
            Select your role to continue
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {roles.map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                onClick={() => navigate(`/login?role=${role.id}`)}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <div className={`inline-flex rounded-lg bg-gradient-to-br ${role.gradient} p-3 text-accent-foreground mb-4`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {role.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-gold-glow scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} Nutranta Seeds Pvt. Ltd. All rights reserved.
      </footer>
    </div>
  );
}
