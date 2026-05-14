import type { Dictionary } from './types';
import en from './en';

const ar: Dictionary = {
  ...en,
  profileAcademy: {
    title: 'دوراتي في أكاديمية موافق',
    carouselControls: 'عناصر التحكم بعرض الدورات',
    previousCourses: 'الدورات السابقة',
    nextCourses: 'الدورات التالية',
    keepGoing: 'متابعة التعلّم',
  },
  profileLayout: {
    signOut: 'تسجيل الخروج',
    avatarAlt: 'صورة الملف الشخصي لـ {{name}}',
    nav: {
      personalInfo: 'المعلومات الشخصية',
      academyCourses: 'دورات أكاديمية موافق',
      myReservations: 'حجوزاتي',
    },
  },
  profilePersonal: {
    contact: {
      title: 'المعلومات الشخصية',
      edit: 'تعديل',
      labels: {
        email: 'البريد الإلكتروني',
        phone: 'رقم الجوال',
        city: 'المدينة',
        country: 'الدولة',
        mailingAddress: 'عنوان المراسلة',
      },
    },
    stats: {
      reservations: {
        title: 'الحجوزات',
        subtitle: 'عبر جميع الخدمات',
      },
      coursesOngoing: {
        title: 'دورات موافق',
        subtitle: 'قيد التنفيذ',
      },
      coursesFinished: {
        title: 'دورات موافق',
        subtitle: 'مكتملة',
      },
    },
  },
  profileReservations: {
    titleReservations: 'حجوزاتي',
    titleResults: 'نتائجي',
    subtitle: 'إدارة مواعيدك القادمة ونتائجك الطبية.',
    searchPlaceholder: 'ابحث في الحجوزات...',
    tabsListAriaLabel: 'نوع العرض',
    tabExaminations: 'الفحوصات',
    tabResults: 'النتائج',
    documentTitleExams: 'موافق — حجوزاتي',
    documentTitleResults: 'موافق — نتائجي',
    status: {
      new: 'جديد',
      progress: 'قيد التنفيذ',
      canceled: 'ملغى',
    },
    preparationConditions: 'شروط التحضير',
    cancelAppointment: 'إلغاء الموعد',
    reorder: 'إعادة الطلب',
    details: 'التفاصيل',
    viewInformation: 'عرض المعلومات',
    download: 'تحميل',
  },
};

export default ar;
