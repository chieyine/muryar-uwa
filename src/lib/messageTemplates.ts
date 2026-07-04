/**
 * Utility functions for managing and formatting message templates and voice content
 */

export interface TemplateSelection {
  category: string;
  language: string;
  channel: string;
}

/**
 * Gets static description/text for fallback demo message templates
 */
export function getFallbackMessage(selection: TemplateSelection): string {
  const { category, language } = selection;

  const templates: Record<string, Record<string, string>> = {
    ANC_REMINDER: {
      ENGLISH: "Hello. This is Muryar Uwa from your PHC. Please remember your ANC visit. If you feel weak, dizzy, have bleeding, severe headache or swelling, please go to the PHC immediately.",
      HAUSA: "Sannu ku da zuwa. Wannan shi ne Muryar Uwa daga PHC dinku. Da fatan za a tuna da ziyarar ANC dinku. Idan kun ji rauni, jiri, zubar jini, ciwon kai mai tsanani ko kumburi, da fatan za a je PHC nan da nan.",
    },
    MATERNAL_NUTRITION: {
      ENGLISH: "Hello. Try to eat small nutritious meals when you can. Beans, groundnut, millet, maize, vegetables, eggs or fish when available can help strengthen you and your baby.",
      HAUSA: "Barka da rana. Yi kokari ku ci kananan abinci masu gina jiki lokacin da za ku iya. Wake, gyada, gero, masara, kayan lambu, kwai ko kifi lokacin da suke da sauki na iya taimaka muku da jaririnku.",
    },
    TOM_BROWN: {
      ENGLISH: "Hello. Your PHC team is organizing a Tom Brown demonstration for mothers. Please attend if it is safe for you. You will learn how to prepare a nutritious local food mixture.",
      HAUSA: "Sannu ku da zuwa. Kungiyar PHC dinku tana shirya nuna shirin Tom Brown ga iyaye mata. Da fatan za a halarta idan yana da lafiya a gare ku. Za ku koyi yadda ake shirya hadin gwiwar abinci na gida mai gina jiki.",
    },
    SAFE_CONTACT: {
      ENGLISH: "Hello. This is a health reminder from your PHC. Please remember your next visit and contact the PHC worker if you need support.",
      HAUSA: "Sannu. Wannan tunatarwa ce ta lafiya daga PHC dinku. Da fatan za a tuna ziyararku ta gaba kuma a tuntubi ma'aikacin PHC idan kuna buƙatar taimako.",
    },
  };

  const catTemplates = templates[category] || templates.SAFE_CONTACT;
  return catTemplates[language] || catTemplates.ENGLISH;
}
