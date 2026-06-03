export const bookingQueryKeys = {
  all: ['booking'] as const,
  branches: (serviceGroupId: number) =>
    [...bookingQueryKeys.all, 'branches', serviceGroupId] as const,
  courses: (serviceGroupId: number) =>
    [...bookingQueryKeys.all, 'courses', serviceGroupId] as const,
  weeklyTimeSlots: (
    branchId: number,
    serviceIds: number[],
    serviceGroupIds: number[]
  ) =>
    [
      ...bookingQueryKeys.all,
      'weeklyTimeSlots',
      branchId,
      serviceIds,
      serviceGroupIds,
    ] as const,
};
