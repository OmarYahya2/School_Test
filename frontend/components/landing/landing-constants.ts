// Static data constants used by the landing page hero component
// Extracted to a separate file to allow landing-hero.tsx to tree-shake sub-views

export const grades = [
  { id: 1, name: "الصف الأول",   color: "from-rose-500 to-pink-600",     lightColor: "from-rose-500/10 to-pink-600/10",     borderColor: "border-rose-500/20",    hoverBorder: "group-hover:border-rose-500/40",    icon: "🎨", desc: "بداية الرحلة"   },
  { id: 2, name: "الصف الثاني",  color: "from-orange-500 to-amber-600",  lightColor: "from-orange-500/10 to-amber-600/10",  borderColor: "border-orange-500/20",   hoverBorder: "group-hover:border-orange-500/40",   icon: "🚀", desc: "اكتشاف جديد"   },
  { id: 3, name: "الصف الثالث",  color: "from-yellow-500 to-orange-500", lightColor: "from-yellow-500/10 to-orange-500/10", borderColor: "border-yellow-500/20",   hoverBorder: "group-hover:border-yellow-500/40",   icon: "⭐", desc: "تطور مستمر"   },
  { id: 4, name: "الصف الرابع",  color: "from-emerald-500 to-teal-600",  lightColor: "from-emerald-500/10 to-teal-600/10",  borderColor: "border-emerald-500/20",  hoverBorder: "group-hover:border-emerald-500/40",  icon: "🔬", desc: "علوم ممتعة"    },
  { id: 5, name: "الصف الخامس",  color: "from-cyan-500 to-blue-600",     lightColor: "from-cyan-500/10 to-blue-600/10",     borderColor: "border-cyan-500/20",    hoverBorder: "group-hover:border-cyan-500/40",    icon: "📚", desc: "معرفة أعمق"   },
  { id: 6, name: "الصف السادس",  color: "from-blue-500 to-indigo-600",   lightColor: "from-blue-500/10 to-indigo-600/10",   borderColor: "border-blue-500/20",    hoverBorder: "group-hover:border-blue-500/40",    icon: "🎯", desc: "تحضير منهجي"  },
  { id: 7, name: "الصف السابع",  color: "from-violet-500 to-purple-600", lightColor: "from-violet-500/10 to-purple-600/10", borderColor: "border-violet-500/20",   hoverBorder: "group-hover:border-violet-500/40",   icon: "💡", desc: "مرحلة جديدة"  },
  { id: 8, name: "الصف الثامن",  color: "from-purple-500 to-pink-600",   lightColor: "from-purple-500/10 to-pink-600/10",   borderColor: "border-purple-500/20",   hoverBorder: "group-hover:border-purple-500/40",   icon: "⚡", desc: "تقدم ملحوظ"   },
  { id: 9, name: "الصف التاسع",  color: "from-indigo-500 to-violet-600", lightColor: "from-indigo-500/10 to-violet-600/10", borderColor: "border-indigo-500/20",   hoverBorder: "group-hover:border-indigo-500/40",   icon: "🏆", desc: "الإنجاز النهائي" },
]

export const subjects = [
  { name: "اللغة العربية",      emoji: "📖", color: "from-blue-500 to-blue-600",     bg: "bg-blue-500/10",    text: "text-blue-400",    desc: "لغتنا الجميلة"       },
  { name: "اللغة الإنجليزية",   emoji: "🔤", color: "from-indigo-500 to-purple-600", bg: "bg-indigo-500/10",  text: "text-indigo-400",  desc: "English Language"     },
  { name: "الرياضيات",          emoji: "🔢", color: "from-purple-500 to-fuchsia-600", bg: "bg-purple-500/10",  text: "text-purple-400",  desc: "أرقام وحساب"         },
  { name: "العلوم والحياة",     emoji: "🔬", color: "from-emerald-500 to-green-600",  bg: "bg-emerald-500/10", text: "text-emerald-400", desc: "اكتشاف العلوم"       },
  { name: "التربية الدينية",    emoji: "🕌", color: "from-amber-500 to-yellow-500",   bg: "bg-amber-500/10",   text: "text-amber-400",   desc: "تعليم ديني"          },
  { name: "الدراسات الاجتماعية",emoji: "🌍", color: "from-rose-500 to-red-600",       bg: "bg-rose-500/10",    text: "text-rose-400",    desc: "التاريخ والجغرافيا"  },
  { name: "التكنولوجيا",        emoji: "💻", color: "from-cyan-500 to-sky-600",       bg: "bg-cyan-500/10",    text: "text-cyan-400",    desc: "عالم التقنية"        },
]

export type GradeItem = typeof grades[number]
export type SubjectItem = typeof subjects[number]
