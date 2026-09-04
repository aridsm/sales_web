import { useUserStore } from "@/stores/userStore";
import { CompanyPermission } from "@/enums/CompanyPermission";

export function usePermission() {
  const permission = useUserStore(
    (s) => s.currentUser?.permission ?? s.activeCompany?.permission,
  );

  return {
    canEdit:
      permission !== undefined &&
      permission !== null &&
      permission >= CompanyPermission.VIEW_EDIT,
    isAdmin: permission === CompanyPermission.ADMIN,
    permission,
  };
}
