import type { RecordData } from "./admin-v2-model";
export type Section = {
  key: string;
  title: string;
  fields: string[];
  mode?: "short" | "medium" | "large";
  array?: string;
  container?: string;
  addHook?: string;
  limit?: number;
  rowFields?: {
    key: string;
    hook: string;
    label: string;
    type?: string;
    required?: boolean;
    max?: number;
  }[];
};
const pair = (name: string) => [`${name}_en`, `${name}_fr`];
const tags = [
  { key: "tags_en", hook: "tags-en", label: "English tags (comma separated)" },
  { key: "tags_fr", hook: "tags-fr", label: "French tags (comma separated)" },
];
export const sections: Record<string, Section[]> = {
  homepage: [
    {
      key: "settings",
      title: "Carousel settings",
      fields: ["hero_autoplay_enabled", "hero_autoplay_interval"],
      mode: "short",
    },
    {
      key: "fallback",
      title: "Fallback hero",
      fields: [
        ...pair("hero_headline"),
        ...pair("hero_headline_accent"),
        ...pair("hero_eyebrow"),
        ...pair("hero_subheadline"),
        ...pair("hero_cta_label"),
        "hero_image_id",
      ],
    },
    {
      key: "who",
      title: "Who we are",
      fields: [...pair("who_we_are_copy"), "who_we_are_image_id"],
    },
    {
      key: "trust",
      title: "Trust statements",
      fields: ["trust_stats"],
      array: "trust_stats",
      container: "trustStats",
      addHook: "addStat",
      limit: 8,
      mode: "short",
      rowFields: [
        { key: "value", hook: "value", label: "Value (optional)", max: 40 },
        {
          key: "label_en",
          hook: "en",
          label: "English label",
          required: true,
          max: 160,
        },
        {
          key: "label_fr",
          hook: "fr",
          label: "French label",
          required: true,
          max: 160,
        },
      ],
    },
    { key: "partner", title: "One partner", fields: pair("one_partner_copy") },
    {
      key: "featured",
      title: "Featured titles",
      fields: ["featured_catalogue_ids"],
    },
  ],
  about: [
    { key: "heritage", title: "Heritage", fields: pair("heritage_copy") },
    ...["purpose", "vision", "mission", "values"].map((key) => ({
      key,
      title: key[0].toUpperCase() + key.slice(1),
      fields: pair(key),
    })),
    {
      key: "team",
      title: "Team capacity",
      fields: ["team_capacity_blocks"],
      array: "team_capacity_blocks",
      container: "blocks",
      addHook: "addBlock",
      limit: 12,
      rowFields: [
        { key: "title_en", hook: "title-en", label: "English title", max: 160 },
        { key: "title_fr", hook: "title-fr", label: "French title", max: 160 },
        { key: "icon", hook: "icon", label: "Icon key", max: 60 },
        {
          key: "description_en",
          hook: "en",
          label: "English description",
          type: "textarea",
        },
        {
          key: "description_fr",
          hook: "fr",
          label: "French description",
          type: "textarea",
        },
        ...tags,
      ],
    },
  ],
  why: [
    {
      key: "presence",
      title: "Local presence",
      fields: pair("local_presence_copy"),
    },
    {
      key: "commitments",
      title: "Quality commitments",
      fields: ["quality_commitment_items"],
      array: "quality_commitment_items",
      container: "items",
      addHook: "addItem",
      limit: 12,
      rowFields: [
        { key: "icon", hook: "icon", label: "Icon key", max: 60 },
        ...[
          "title",
          "description",
          "eyebrow",
          "title_lead",
          "title_accent",
        ].flatMap((stem) =>
          ["en", "fr"].map((lang) => ({
            key: `${stem}_${lang}`,
            hook: `${stem === "title_lead" ? "lead" : stem === "title_accent" ? "accent" : stem}-${lang}`,
            label: `${lang === "en" ? "English" : "French"} ${stem.replaceAll("_", " ")}`,
            type: stem === "description" ? "textarea" : "text",
            max: stem === "description" ? 2000 : 160,
          })),
        ),
        ...tags,
      ],
    },
  ],
  contact: [
    {
      key: "intro",
      title: "Introduction",
      fields: pair("hero_copy"),
      mode: "medium",
    },
    {
      key: "location",
      title: "Map coordinates (optional)",
      fields: ["map_lat", "map_lng"],
      mode: "short",
    },
    {
      key: "projects",
      title: "Project types",
      fields: ["project_type_options"],
      array: "project_type_options",
      container: "options",
      addHook: "addOption",
      limit: 30,
      mode: "short",
      rowFields: [
        {
          key: "label_en",
          hook: "en",
          label: "English label",
          required: true,
          max: 160,
        },
        {
          key: "label_fr",
          hook: "fr",
          label: "French label",
          required: true,
          max: 160,
        },
      ],
    },
  ],
  settings: [
    {
      key: "identity",
      title: "Identity",
      fields: [...pair("company_name"), ...pair("tagline")],
    },
    {
      key: "contact",
      title: "Contact details",
      fields: ["address", "email", "phone_1", "phone_2"],
    },
    {
      key: "footer",
      title: "Footer and newsletter",
      fields: [
        ...pair("footer_tagline"),
        ...pair("newsletter_copy"),
        "parent_company_url",
      ],
    },
    {
      key: "social",
      title: "Social links",
      fields: ["social_links"],
      array: "social_links",
      container: "socialLinks",
      addHook: "addSocial",
      limit: 10,
      mode: "short",
      rowFields: [
        { key: "platform", hook: "platform", label: "Platform", max: 60 },
        { key: "url", hook: "url", label: "URL", type: "url" },
      ],
    },
    {
      key: "seo",
      title: "SEO defaults",
      fields: ["seo_default_title", "seo_default_description", "og_image_id"],
    },
  ],
};
export const pages: Record<
  string,
  {
    source: string;
    endpoint: string;
    form: string;
    title: string;
    publicRoute: string;
    singleton?: boolean;
  }
> = {
  catalogue: {
    source: "catalogue",
    endpoint: "/api/catalogue-admin",
    form: "editor",
    title: "catalogue title",
    publicRoute: "/catalogue",
  },
  news: {
    source: "news",
    endpoint: "/api/news-admin",
    form: "editor",
    title: "news article",
    publicRoute: "/news",
  },
  subjects: {
    source: "subjects",
    endpoint: "/api/subjects-admin",
    form: "editor",
    title: "subject",
    publicRoute: "/catalogue",
  },
  homepage: {
    source: "homepage",
    endpoint: "/api/homepage-admin",
    form: "homepageForm",
    title: "Homepage",
    publicRoute: "/",
    singleton: true,
  },
  about: {
    source: "about",
    endpoint: "/api/about-admin",
    form: "aboutForm",
    title: "About page",
    publicRoute: "/about",
  },
  why: {
    source: "why",
    endpoint: "/api/why-choose-us-admin",
    form: "whyForm",
    title: "Why choose us",
    publicRoute: "/why-choose-us",
  },
  contact: {
    source: "contact",
    endpoint: "/api/contact-settings-admin",
    form: "contactForm",
    title: "Contact page",
    publicRoute: "/contact",
  },
  settings: {
    source: "settings",
    endpoint: "/api/site-settings-admin",
    form: "settingsForm",
    title: "Site settings",
    publicRoute: "/",
  },
  legal: {
    source: "legal",
    endpoint: "/api/legal-pages-admin",
    form: "",
    title: "legal page",
    publicRoute: "/privacy-policy",
  },
  services: {
    source: "services",
    endpoint: "/api/services-admin",
    form: "serviceForm",
    title: "service",
    publicRoute: "/services",
  },
};
for (const key of ["about", "why", "contact", "settings"])
  pages[key].singleton = true;
export const recordTitle = (record: RecordData, lang = "en") =>
  String(
    record[`title_${lang}`] ??
      record[`headline_${lang}`] ??
      record[`name_${lang}`] ??
      record[`label_${lang}`] ??
      (record.page === "privacy_policy"
        ? "Privacy Policy"
        : record.page === "terms_of_use"
          ? "Terms of Use"
          : (record.platform ?? "")),
  ) || `${lang === "fr" ? "French" : "English"} copy missing`;
