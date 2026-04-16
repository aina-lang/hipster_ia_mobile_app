/**
 * 🕐 TIME-BASED MESSAGES
 * Dynamic messages based on user's connection time
 * Each time slot contains 10 unique, fun messages
 * 
 * Tone: Fun, human, light, never heavy or aggressive
 */

export type TimeSlot = 
  | 'morning' // 8h – 10h
  | 'preNoon' // 10h30 – 12h
  | 'postLunch' // 12h30 – 15h
  | 'afternoon' // 15h – 18h
  | 'evening' // 18h – 20h
  | 'night' // 20h – 22h
  | 'lateNight'; // 22h – 00h

export interface TimeSlotConfig {
  name: string;
  startHour: number;
  endHour: number;
  messages: string[];
}

export const TIME_SLOTS: Record<TimeSlot, TimeSlotConfig> = {
  morning: {
    name: '8h – 10h',
    startHour: 8,
    endHour: 10,
    messages: [
      "Bon… café d'abord ou grosse idée direct ? ☕",
      "On se met en route tranquille ou on part déjà en mode machine de guerre ?",
      "T'as ouvert l'app, donc j'imagine qu'on va faire semblant d'être super productif 😏",
      "Allez, premier move de la journée : on crée quoi de propre ?",
      "Un café, une bonne idée, et normalement la journée démarre bien.",
      "T'es du matin efficace ou du matin \"laisse-moi respirer 5 minutes\" ?",
      "Si t'es là si tôt, c'est qu'il va se passer un truc stylé aujourd'hui.",
      "Hop, on attaque la journée ou on négocie encore avec ton cerveau ?",
      "Le matin, y a deux teams : café / survie. Toi t'es où ?",
      "On commence doucement… ou on sort direct une idée qui claque ?",
    ],
  },

  preNoon: {
    name: '10h30 – 12h',
    startHour: 10,
    endHour: 12,
    messages: [
      "Allez, encore un petit effort avant d'aller penser à manger 😄",
      "Dernière ligne droite avant la pause, on fait un truc propre ?",
      "Bon, on reste concentré encore un peu avant de partir en quête de bouffe ?",
      "T'es encore focus ou ton cerveau est déjà à table ?",
      "On boucle un bon truc maintenant et après tu pourras manger l'esprit tranquille.",
      "Juste avant midi, c'est souvent là qu'on a les meilleures idées.",
      "Encore une petite création et après, promis, tu penseras à ton repas.",
      "On finit fort avant midi ou on commence déjà à décrocher ?",
      "Si on fait un truc bien maintenant, ça compte presque comme une matinée ultra productive.",
      "Bon… avant que ton estomac prenne le contrôle, on avance un peu ?",
    ],
  },

  postLunch: {
    name: '12h30 – 15h',
    startHour: 12,
    endHour: 15,
    messages: [
      "Bon… soyons honnêtes, là ton corps veut une sieste 😴",
      "Après manger, le vrai défi ce n'est pas de travailler, c'est de rester éveillé.",
      "Tu veux bosser ou fixer un mur en silence pendant 12 minutes ?",
      "On fait un petit truc tranquille ou ton cerveau est encore en digestion ?",
      "L'après-repas, c'est toujours un peu flou… mais on peut quand même sortir un bon truc.",
      "Je sens une énergie de \"je vais m'y mettre… dans 5 minutes\".",
      "Si t'arrives à être productif maintenant, franchement respect.",
      "Entre nous, c'est l'heure la plus traîtresse de la journée.",
      "On redémarre doucement ou on assume totalement le mode ralenti ?",
      "Allez, un petit effort avant que la sieste imaginaire gagne.",
    ],
  },

  afternoon: {
    name: '15h – 18h',
    startHour: 15,
    endHour: 18,
    messages: [
      "Ok, là on peut encore sauver la journée avec un truc bien 🔥",
      "C'est le moment parfait pour faire un truc propre avant la fin de journée.",
      "On remet un coup de boost ou on glisse doucement vers la flemme ?",
      "Allez, une bonne idée maintenant et tu finis la journée comme une star.",
      "C'est l'heure du rebond. On se remet dedans ?",
      "Ton énergie revient ou faut encore négocier un peu ?",
      "On est sur le créneau où soit tu brilles, soit tu regardes l'heure toutes les 3 minutes.",
      "Petit coup de collier et on sort quelque chose de stylé ?",
      "Si t'es encore là, autant en profiter pour faire un vrai bon move.",
      "Fin d'aprèm = moment parfait pour une idée simple mais efficace.",
    ],
  },

  evening: {
    name: '18h – 20h',
    startHour: 18,
    endHour: 20,
    messages: [
      "Alors… on clôture la journée en beauté ou on fait semblant d'avoir déjà fini ?",
      "T'es encore là, donc soit t'es motivé, soit t'as un truc important à sortir 😏",
      "Avant de décrocher, on se fait un dernier petit move intelligent ?",
      "C'est souvent en fin de journée qu'on a les idées les plus simples et les plus efficaces.",
      "On termine proprement ou on repousse ça au \"moi de demain\" ?",
      "Encore un petit truc maintenant et ce soir tu seras tranquille.",
      "Fin de journée… mais pas obligé de finir en roue libre.",
      "On se fait un dernier effort élégant avant la coupure ?",
      "Là, soit tu lâches tout, soit tu sors un dernier truc qui fait plaisir.",
      "Allez, un dernier tour de piste avant de fermer le bureau mental.",
    ],
  },

  night: {
    name: '20h – 22h',
    startHour: 20,
    endHour: 22,
    messages: [
      "T'es encore en train de bosser là ? Franchement, respect 😄",
      "Bon… t'es motivé ou t'as juste eu une idée au mauvais moment ?",
      "À cette heure-là, soit on est inspiré, soit on fait n'importe quoi.",
      "On fait un dernier truc malin avant de décrocher ?",
      "Dis-moi que t'as pas ouvert l'app juste pour \"2 minutes\" 👀",
      "Les idées du soir sont parfois excellentes. Parfois très discutables aussi.",
      "Toi, t'es clairement dans la team \"je pense encore à mon business le soir\".",
      "Si t'es là maintenant, c'est qu'on a encore un petit truc à sortir.",
      "Allez, une dernière idée et après on soufflera un peu.",
      "On bosse encore ou on papote juste pour le plaisir ?",
    ],
  },

  lateNight: {
    name: '22h – 00h',
    startHour: 22,
    endHour: 24,
    messages: [
      "Ok… là on est sur un niveau d'implication assez sérieux 😅",
      "Tu bosses encore ou t'es juste en train d'avoir des idées à des heures douteuses ?",
      "C'est tard, mais parfois les meilleures idées arrivent maintenant.",
      "On note ton idée avant qu'elle disparaisse demain matin ?",
      "Là, clairement, ton cerveau refuse de couper.",
      "Tu sais que les gens \"raisonnables\" dorment à cette heure-là ? 😏",
      "Bon, raconte. C'est une idée de génie ou une idée de fatigue ?",
      "On pose ça ici avant que ton cerveau parte totalement ailleurs.",
      "Team nocturne validée. On fait quoi du coup ?",
      "Franchement, j'aime bien les gens qui ont encore des idées à cette heure-ci.",
    ],
  },
};

/**
 * Get the current time slot based on user's hour
 */
export function getCurrentTimeSlot(hour: number): TimeSlot {
  if (hour >= 8 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 12) return 'preNoon';
  if (hour >= 12 && hour < 15) return 'postLunch';
  if (hour >= 15 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 20) return 'evening';
  if (hour >= 20 && hour < 22) return 'night';
  return 'lateNight'; // hour >= 22 || hour < 8
}

/**
 * Get a specific time slot config
 */
export function getTimeSlotConfig(slot: TimeSlot): TimeSlotConfig {
  return TIME_SLOTS[slot];
}
