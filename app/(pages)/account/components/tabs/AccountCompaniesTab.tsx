"use client";

import React from "react";
import { CompanyListItem, CompanyInvitation } from "@/api/schemas/Company";
import { User } from "@/api/schemas/User";
import { PaginationResult } from "@/app/utils/usePagination";
import CompaniesCard from "../CompaniesCard";
import InvitationsCard from "../InvitationsCard";

interface AccountCompaniesTabProps {
  companiesPagination: PaginationResult<CompanyListItem>;
  currentUser: User | null;
  invitations: CompanyInvitation[];
  onOpenMembers: (company: CompanyListItem) => void;
  onSwitchCompany: (companyId: string) => Promise<void>;
  onEditCompany: (company: CompanyListItem) => void;
  onDeleteCompany: (company: CompanyListItem) => void;
  onCreateCompanyClick: () => void;
  onAcceptInvitation: (id: string) => Promise<void>;
  onRejectInvitation: (id: string) => Promise<void>;
}

export default function AccountCompaniesTab({
  companiesPagination,
  currentUser,
  invitations,
  onOpenMembers,
  onSwitchCompany,
  onEditCompany,
  onDeleteCompany,
  onCreateCompanyClick,
  onAcceptInvitation,
  onRejectInvitation,
}: AccountCompaniesTabProps) {
  return (
    <div className="flex flex-col gap-3 md:gap-5 w-full">
      <InvitationsCard
        invitations={invitations}
        onAccept={onAcceptInvitation}
        onReject={onRejectInvitation}
      />

      <CompaniesCard
        companiesPagination={companiesPagination}
        currentUser={currentUser}
        onOpenMembers={onOpenMembers}
        onSwitchCompany={onSwitchCompany}
        onEditCompany={onEditCompany}
        onDeleteCompany={onDeleteCompany}
        onCreateCompanyClick={onCreateCompanyClick}
      />
    </div>
  );
}
