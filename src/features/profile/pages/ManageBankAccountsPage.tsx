import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BankAccountCard } from '../components/BankAccountCard';
import { AddBankAccountModal } from '../components/AddBankAccountModal';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { Plus, CreditCard } from 'lucide-react';
import ManageBankAccountsSkeleton from '../components/ManageBankAccountsSkeleton';
import { Card, CardContent } from '@/components/ui/Card';
import { BankAccount, CreateBankAccountPayload } from '../services/bankAccountService';
import {
  useBankAccountsQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
  useSetDefaultBankAccountMutation,
} from '../hooks/useBankAccountMutations';

const ManageBankAccountsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
  const [optimisticDefaultId, setOptimisticDefaultId] = useState<string | null>(null);

  // Queries
  const { data: accountsData, isLoading, error } = useBankAccountsQuery();

  // Mutations
  const createMutation = useCreateBankAccountMutation();
  const updateMutation = useUpdateBankAccountMutation();
  const deleteMutation = useDeleteBankAccountMutation();
  const setDefaultMutation = useSetDefaultBankAccountMutation();

  const accounts = accountsData?.data || [];

  const handleToggleDefault = async (accountId: string, isDefault: boolean) => {
    if (isDefault) {
      // Set this account as default
      await setDefaultMutation.mutateAsync(accountId);
    } else {
      // Update account to remove default status
      const account = accounts.find((a) => a.id === accountId);
      if (account) {
        await updateMutation.mutateAsync({
          id: accountId,
          data: {
            ...account,
            isDefault: false,
          },
        });
      }
    }
  };

  const handleAddAccount = async (data: CreateBankAccountPayload) => {
    try {
      if (editingAccount) {
        await updateMutation.mutateAsync({ id: editingAccount.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      // Only close modal on success
      setIsModalOpen(false);
      setEditingAccount(null);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      // Modal stays open so user can retry or fix the issue
      console.error('Failed to save bank account:', error);
    }
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDeleteAccount = (account: BankAccount) => {
    setAccountToDelete(account);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      deleteMutation.mutate(accountToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setAccountToDelete(null);
        },
      });
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setAccountToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  if (isLoading) {
    return <ManageBankAccountsSkeleton />;
  }

  if (error) {
    return (
      <Card className="bg-white border-gray-200 shadow-none h-[calc(100vh-200px)] justify-center items-center">
        <CardContent className="px-4 sm:px-6">
          <div className="text-center py-12 text-red-500">
            Failed to load bank accounts. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200 shadow-none min-h-[calc(100vh-200px)] flex flex-col">
      <CardContent className="px-4 sm:px-6 flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Manage Bank Accounts</h2>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto min-w-full sm:min-w-[180px] h-10 sm:h-11 bg-primary hover:bg-primary/90 text-white px-3 sm:px-5 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank Account</span>
          </Button>
        </div>

        {/* Bank Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 ">
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <BankAccountCard
                key={account.id}
                id={account.id}
                accountHolder={account.accountHolderName}
                accountNumber={`XXXX XXXX XXXX ${account.accountNumber.slice(-4)}`}
                bankName={account.bankName}
                onEdit={() => handleEditAccount(account)}
                onDelete={() => handleDeleteAccount(account)}
                onToggleDefault={handleToggleDefault}
                isDefault={account.isDefault}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center min-h-[400px]">
              <CreditCard className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No bank accounts added yet</p>
            </div>
          )}
        </div>

        {/* Add/Edit Bank Account Modal */}
        <AddBankAccountModal
          isOpen={isModalOpen}
          isSubmitting={createMutation.isPending || updateMutation?.isPending}
          onClose={handleCloseModal}
          onSubmit={handleAddAccount}
          totalBankAccount={accounts.length > 0 ? true : false}
          initialData={
            editingAccount
              ? {
                  accountHolderName: editingAccount.accountHolderName,
                  bankName: editingAccount.bankName,
                  isDefault: editingAccount.isDefault,
                  accountNumber: editingAccount.accountNumber,
                  routingNumber: editingAccount.routingNumber,
                  swiftCode: editingAccount.swiftCode,
                  accountType: editingAccount.accountType,
                }
              : undefined
          }
          isEdit={!!editingAccount}
        />

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Delete Bank Account?"
            description={
              <>
                Are you sure you want to delete the bank account ending in{' '}
                <strong className="font-semibold">{accountToDelete?.accountNumber}</strong>? This
                action cannot be undone.
              </>
            }
            confirmText="Yes, I'm Sure"
            cancelText="Cancel"
            isLoading={deleteMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ManageBankAccountsPage;
