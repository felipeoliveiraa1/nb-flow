import { FlaskConical, Camera, ShoppingBag, Target, type LucideIcon } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="px-5 pt-12">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-nb-pink to-nb-pink-dark shadow-lg shadow-nb-pink/20">
            <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white">
              A
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-nb-pink shadow-sm">
            Lv.1
          </div>
        </div>

        <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-xl font-semibold text-nb-dark">
          Angel
        </h1>
        <p className="text-sm text-nb-gray-warm">Nivel Iniciante</p>
      </div>

      <div className="mt-6 rounded-2xl bg-nb-gray-light p-5">
        <div className="flex justify-between text-xs text-nb-dark-soft/70">
          <span>0 / 500 XP para Pro</span>
          <span>0%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-nb-pink to-nb-pink-dark transition-all duration-700"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-nb-dark">
          Como ganhar XP
        </h2>
        <div className="mt-3 space-y-3">
          <XPAction action="Analise Flow AI" xp={50} icon={FlaskConical} />
          <XPAction action="Foto Antes/Depois" xp={30} icon={Camera} />
          <XPAction action="Compra NB Shop" xp={20} icon={ShoppingBag} />
          <XPAction action="Meta mensal" xp={100} icon={Target} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-nb-dark">
          Ranking Angels
        </h2>
        <div className="mt-3 space-y-2">
          {leaderboard.map((angel, i) => (
            <div
              key={angel.name}
              className="flex items-center gap-3 rounded-xl bg-nb-gray-light p-3"
            >
              <span className="w-6 text-center text-sm font-bold text-nb-pink-dark">
                {i + 1}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nb-pink-soft text-sm font-semibold text-nb-pink-dark">
                {angel.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-nb-dark">{angel.name}</p>
                <p className="text-xs text-nb-gray-warm">{angel.level}</p>
              </div>
              <span className="text-xs font-bold text-nb-pink-dark">
                {angel.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function XPAction({
  action,
  xp,
  icon: Icon,
}: {
  action: string;
  xp: number;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-nb-gray-light p-3">
      <Icon className="h-5 w-5 text-nb-pink" />
      <span className="flex-1 text-sm text-nb-dark-soft">{action}</span>
      <span className="text-sm font-bold text-nb-pink">+{xp} XP</span>
    </div>
  );
}

const leaderboard = [
  { name: "Fernanda S.", level: "Elite", xp: 2340 },
  { name: "Juliana M.", level: "Pro", xp: 1280 },
  { name: "Camila R.", level: "Pro", xp: 890 },
  { name: "Ana Paula", level: "Iniciante", xp: 420 },
  { name: "Beatriz L.", level: "Iniciante", xp: 180 },
];
