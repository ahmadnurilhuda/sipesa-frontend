export type Role = "ADMIN" | "WALI_SANTRI" | "WALI_KELAS" | "WALI_KAMAR" | "KEAMANAN" | "KAUR_ASRAMA";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: Role;
  active: boolean;
};

export type PermissionStatus =
  | "DRAFT"
  | "PENDING_WALI_KELAS"
  | "REJECTED_BY_WALI_KELAS"
  | "PENDING_WALI_KAMAR"
  | "REJECTED_BY_WALI_KAMAR"
  | "APPROVED"
  | "CHECKED_OUT"
  | "CHECKED_IN"
  | "COMPLETED"
  | "OVERDUE"
  | "CANCELLED";

export type Permission = {
  id: string;
  studentId: string;
  studentName: string;
  permissionType: string;
  reason: string;
  destination: string;
  startAt: string;
  expectedReturnAt: string;
  checkedOutAt?: string;
  checkedInAt?: string;
  status: PermissionStatus;
  approvalLogs?: PermissionApprovalLog[];
};

export type PermissionApprovalLog = {
  id: string;
  actorName: string;
  actorRole: Role;
  fromStatus: PermissionStatus;
  toStatus: PermissionStatus;
  note?: string;
  createdAt: string;
};

export type Student = {
  id: string;
  nis: string;
  name: string;
  gender: string;
  active: boolean;
  classId?: string;
  roomId?: string;
  parentGuardianId?: string;
};

export type DashboardSummary = {
  totalApprovedPermissions: number;
  totalCheckedOutStudents: number;
  totalCompletedToday: number;
  totalOverdueStudents: number;
  pendingWaliKelas: number;
  pendingWaliKamar: number;
};
