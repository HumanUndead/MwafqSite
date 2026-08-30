import type { PrivacyPolicyContent } from '../types/legalContent.types';

export const privacyPolicyEn: PrivacyPolicyContent = {
  metaTitle: 'Privacy Policy',
  metaDescription:
    'How Mwafq collects, uses, shares, and protects your personal data across the Mwafq app and website.',
  eyebrow: 'Legal',
  title: 'Privacy Policy',
  intro:
    'This policy explains what personal data Mwafq collects through the Mwafq mobile app (Android and iOS) and the Mwafq website, why we collect it, who we share it with, and the rights you have over it.',
  lastUpdatedLabel: 'Last updated',
  lastUpdated: 'August 30, 2026',
  version: 'Version 1.0',
  tocTitle: 'Contents',
  sections: [
    {
      id: 'who-we-are',
      title: '1. Who we are',
      paragraphs: [
        'Mwafq ("we", "us", "our") operates the Mwafq mobile application and the Mwafq website (together, the "Services").',
        'Mwafq is the data controller for the personal data described in this policy — the entity that decides why and how your personal data is processed.',
      ],
      bullets: [
        'App name: Mwafq',
        'Android package name: com.kensoftware.mwafq',
        'iOS bundle identifier: com.kensoftware.mwafq',
      ],
    },
    {
      id: 'scope',
      title: '2. What this policy covers',
      paragraphs: [
        'This policy applies to the Mwafq mobile app on Android and iOS, and to the Mwafq website. It does not apply to third-party apps or websites that Mwafq links to, even if you reach them from inside our Services.',
        `This policy is effective from the "Last updated" date shown above. If we make a material change, we will notify you inside the app before the change takes effect.`,
      ],
    },
    {
      id: 'data-we-collect',
      title: '3. Data we collect',
      paragraphs: [
        'We collect the categories of personal data described below. We collect your national or resident identity number and your health-related data because our Services are health-booking services — we call these out explicitly because they are sensitive data under Saudi Arabia\'s Personal Data Protection Law (PDPL).',
      ],
      table: {
        columns: ['Category', 'Examples', 'When it is collected'],
        rows: [
          [
            'Account and identity',
            'First and last name, date of birth, national/identity number, mobile number or email, password, one-time SMS passcode, country, city, address, postal code, profile photo',
            'Sign-up, sign-in, and profile edits',
          ],
          [
            'Family members you book for',
            'The same identity details above for any family member you add to your account',
            'When you add a family member or book on their behalf',
          ],
          [
            'Health and medical',
            'Appointments and reservations, examination and lab/test results, the medical services and providers you choose',
            'When you book, and when your results become available',
          ],
          [
            'Device health data (Health Connect / Apple Health)',
            'Steps, sleep, heart rate, blood pressure, blood glucose',
            'Only if you grant permission — see Section 4',
          ],
          [
            'Location',
            'Precise (GPS) and approximate location',
            'Only when you use the "choose a medical facility" screen, to sort and map facilities near you',
          ],
          [
            'Payment',
            'Payment amount, status, and transaction identifier (never your full card number — see Section 3, Payments)',
            'When you pay for a service',
          ],
          [
            'Device, usage and diagnostics',
            'Device model, OS version, app version, coarse region, screens and events used, app preferences, push notification token, failed-request diagnostics',
            'While you use the app',
          ],
          [
            'Data stored on your device',
            'Your sign-in token, a local content cache, and your app preferences',
            'Stored locally on your device only',
          ],
        ],
      },
      note: 'We never receive or store your full payment card number. See "Payments" below.',
    },
    {
      id: 'health-data',
      title: '4. Health Connect and Apple Health',
      paragraphs: [
        'With your permission, the Mwafq app can read the following data types from Android Health Connect or Apple Health: steps, sleep sessions and stages, heart rate, blood pressure, and blood glucose. Access is read-only — Mwafq never writes data back to Health Connect or Apple Health.',
      ],
      bullets: [
        'Why we access it: solely to display your own activity and vital signs inside the app, alongside your appointments and test results. We do not use this data for any other purpose.',
        'It never leaves your device: these readings are read from Health Connect / Apple Health and processed on your device only. They are not uploaded to Mwafq servers, not stored in Mwafq\'s database, and not included in any backup Mwafq holds.',
        'It is never sold, shared, or used for advertising: Mwafq does not sell this data, does not share it with any third party, does not use it for advertising or marketing, and does not use it to make any credit, insurance, employment, or other eligibility decision about you.',
        'How to grant or revoke access: you grant access through the Health Connect (or Apple Health) permission dialog on your device. You can withdraw this permission at any time from your device\'s Health Connect / Health settings. Revoking access does not affect any other part of the app — your health cards simply stop showing data.',
        'Retention: Mwafq does not retain this data. Each reading is held in memory only for as long as the relevant screen is open and is re-read from Health Connect / Apple Health each time you view it. There is nothing stored for Mwafq to delete. Uninstalling the app removes any cached view of it.',
      ],
    },
    {
      id: 'purposes',
      title: '5. Why we use your data, and our legal basis',
      table: {
        columns: ['Purpose', 'Legal basis under PDPL'],
        rows: [
          [
            'Creating and managing your account, and booking and managing your appointments',
            'Performance of a contract with you',
          ],
          [
            'Delivering your examination and test results',
            'Performance of a contract with you',
          ],
          ['Processing your payments', 'Performance of a contract with you'],
          [
            'Sending you appointment and account notifications',
            'Performance of a contract with you / legitimate interest',
          ],
          ['Responding to your support requests', 'Legitimate interest'],
          [
            'Understanding app usage to maintain and improve the Services',
            'Legitimate interest',
          ],
          [
            'Keeping healthcare records as required by applicable regulation',
            'Legal obligation',
          ],
          [
            'Detecting and preventing fraud and misuse of the Services',
            'Legitimate interest',
          ],
          [
            'Sending you marketing communications, where applicable',
            'Consent',
          ],
        ],
      },
    },
    {
      id: 'consent',
      title: '6. Consent, and how to withdraw it',
      paragraphs: [
        'Some data is only collected with your explicit permission: health data (Health Connect / Apple Health), location, camera and photo library access, and push notifications. You control each of these from your device\'s own settings.',
        'You can withdraw any of these permissions at any time. Withdrawing a permission stops the related feature from working — for example, revoking location access means the facility map can no longer sort locations by distance — but does not affect any processing we already carried out before you withdrew it, and does not affect the rest of the app.',
      ],
    },
    {
      id: 'sharing',
      title: '7. Who we share it with',
      paragraphs: [
        'Booking an appointment necessarily discloses your identity and the relevant booking details to the medical facility, laboratory, or clinic you choose, so that facility can provide your service. This is the primary way Mwafq shares personal data.',
      ],
      table: {
        columns: ['Party', 'Role', 'Data it sees'],
        rows: [
          [
            'The medical facility, laboratory or clinic you book with',
            'Provides the medical service you booked',
            'Your booking and the identity details the facility needs to serve you',
          ],
          [
            'Google — Firebase Analytics',
            'Understanding how the app is used',
            'App instance identifier, device and OS information, coarse region, screen and event activity, your Mwafq account identifier, and the preference and age-band data described in Section 3. Never an advertising identifier.',
          ],
          [
            'Google — Maps SDK and Places',
            'Powering the facility map',
            'Map requests, including the area you are viewing',
          ],
          [
            'Google (FCM) / Apple (APNs)',
            'Delivering push notifications',
            'Your device push token and the notification content',
          ],
          [
            'Expo (Expo Application Services)',
            'Issuing push tokens and delivering app updates',
            'Push token; device and app version information when checking for an update',
          ],
          [
            'Moyasar',
            'Processing your card payment',
            'Full card details, payment amount, and transaction metadata',
          ],
          [
            'Vimeo',
            'Playing Mwafq Academy course videos inside the app',
            'Video playback requests and your IP address',
          ],
        ],
      },
      note: 'Mwafq does not sell your personal data, and does not share it with data brokers or advertising networks. We may also disclose personal data where required by law or a competent regulator, or as part of a merger, acquisition, or sale of assets — in which case this policy would continue to apply to your data under the new owner.',
    },
    {
      id: 'transfers',
      title: '8. International transfers',
      paragraphs: [
        'Some of the third parties in Section 7 (analytics, push notification delivery, and app update delivery) may process data outside Saudi Arabia in the ordinary course of providing their service. Where this happens, we require appropriate safeguards to protect your data in line with PDPL.',
      ],
    },
    {
      id: 'retention',
      title: '9. How long we keep it',
      paragraphs: [
        'We keep personal data only for as long as necessary for the purposes described in this policy, or as required by applicable law.',
      ],
      table: {
        columns: ['Data category', 'Retention period', 'Basis'],
        rows: [
          [
            'Account and profile data',
            'For as long as your account remains active, plus a limited period after closure',
            'Legitimate interest / legal obligation',
          ],
          [
            'Appointment and medical records',
            'The minimum period required by Saudi healthcare record-keeping regulation',
            'Legal obligation',
          ],
          [
            'Payment and invoice records',
            'The minimum period required by Saudi financial record-keeping regulation',
            'Legal obligation',
          ],
          [
            'Analytics data',
            'A limited rolling period, then aggregated or deleted',
            'Legitimate interest',
          ],
          [
            'Support correspondence',
            'For as long as needed to resolve your request and for a reasonable period after',
            'Legitimate interest',
          ],
          [
            'Device-local cache and preferences',
            'Until you sign out or uninstall the app',
            'Cleared on sign-out; removed on uninstall',
          ],
        ],
      },
    },
    {
      id: 'security',
      title: '10. How we protect it',
      bullets: [
        'Data is encrypted in transit between the app and our servers.',
        'Your sign-in token is stored in your device\'s secure store (Android Keystore / iOS Keychain), not in plain text.',
        'The payment screen blocks screenshots while your card details are entered, and the payment session automatically expires after five minutes or as soon as the app is moved to the background.',
        'We never receive or store your full card number — it is entered directly into Moyasar\'s own secure payment form.',
      ],
    },
    {
      id: 'your-rights',
      title: '11. Your rights',
      paragraphs: [
        'Under the Saudi Personal Data Protection Law (PDPL), you have the right to:',
      ],
      bullets: [
        'Be informed about how your personal data is collected and used (this policy).',
        'Access the personal data we hold about you.',
        'Obtain a copy of your personal data in a readable format.',
        'Request correction of inaccurate or incomplete personal data.',
        'Request destruction of your personal data, subject to our legal retention obligations.',
      ],
      note: 'To exercise any of these rights, contact us through our support channels in the app. If you are not satisfied with our response, you may escalate your complaint to the Saudi Data & Artificial Intelligence Authority (SDAIA).',
    },
    {
      id: 'delete-account',
      title: '12. Deleting your account',
      paragraphs: [
        'You can request deletion of your Mwafq account and the personal data associated with it at any time. Full details of what is deleted, what is retained, and how long the process takes are on our dedicated account deletion page.',
      ],
      note: 'See /account-deletion for full instructions.',
    },
    {
      id: 'children',
      title: '13. Children',
      paragraphs: [
        'Mwafq accounts are intended for adults. A parent or legal guardian may add a child as a family member on their own account in order to book medical services on the child\'s behalf, and by doing so confirms they have the authority to act for that child and are responsible for the accuracy of the data provided.',
        'A parent or guardian may request deletion of a child\'s data at any time through our support channels in the app.',
      ],
    },
    {
      id: 'cookies',
      title: '14. Cookies and similar technologies',
      paragraphs: [
        'Our website uses cookies and similar technologies necessary to operate the site. Within the app, we store a local content cache and your app preferences on your device, as described in Section 3. Embedded video players (Vimeo) and maps (Google Maps) used inside the app or website may set their own cookies or similar identifiers under their own privacy policies.',
      ],
    },
    {
      id: 'changes',
      title: '15. Changes to this policy',
      paragraphs: [
        'We may update this policy from time to time. If we make a material change, we will notify you inside the app before the change takes effect. Previous versions of this policy remain available at a permanent link on request.',
      ],
    },
  ],
};
