export const bookingQueryKeys = {
  all: ['booking'] as const,
  branches: (serviceGroupId: number) =>
    [...bookingQueryKeys.all, 'branches', serviceGroupId] as const,
  timeSlots: (
    branchId: number,
    serviceGroupId: number,
    dateChosen: string | null
  ) =>
    [
      ...bookingQueryKeys.all,
      'timeSlots',
      branchId,
      serviceGroupId,
      dateChosen,
    ] as const,
  courses: (serviceGroupId: number) =>
    [...bookingQueryKeys.all, 'courses', serviceGroupId] as const,
};
