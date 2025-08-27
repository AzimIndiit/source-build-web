import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BankAccountCard } from '../components/BankAccountCard';
import { AddBankAccountModal } from '../components/AddBankAccountModal';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/Card';

interface BankAccount {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  accountType: 'savings' | 'checking' | 'current';
}

const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    accountHolderName: 'Yousef Alaoui',
    bankName: 'Royal Bank of Scotland',
    accountNumber: 'XXXX XXXX XXXX 7890',
    routingNumber: '123456789',
    swiftCode: 'RBSSGB2L',
    accountType: 'checking',
  },
  {
    id: '2',
    accountHolderName: 'Yousef Alaoui',
    bankName: 'Nationwide Building Society',
    accountNumber: 'XXXX XXXX XXXX 7576',
    routingNumber: '987654321',
    swiftCode: 'NAIAGB21',
    accountType: 'savings',
  },
  {
    id: '3',
    accountHolderName: 'Yousef Alaoui',
    bankName: 'HSBC',
    accountNumber: 'XXXX XXXX XXXX 7576',
    routingNumber: '456789123',
    swiftCode: 'HBUKGB4B',
    accountType: 'current',
  },
];

const ManageBankAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);

  const handleAddAccount = async (data: Omit<BankAccount, 'id'>) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (editingAccount) {
      // Update existing account
      setAccounts(
        accounts.map((acc) => (acc.id === editingAccount.id ? { ...acc, ...data } : acc))
      );
      toast.success('Bank account updated successfully');
    } else {
      // Add new account
      const newAccount: BankAccount = {
        ...data,
        id: Date.now().toString(),
        // Mask account number for display
        accountNumber: `XXXX XXXX XXXX ${data.accountNumber.slice(-4)}`,
      };
      setAccounts([...accounts, newAccount]);
      toast.success('Bank account added successfully');
    }

    setEditingAccount(null);
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
      setAccounts(accounts.filter((acc) => acc.id !== accountToDelete.id));
      toast.success('Bank account deleted successfully');
      setDeleteModalOpen(false);
      setAccountToDelete(null);
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

  return (
    <Card className="bg-white border-gray-200 shadow-none">
      <CardContent className="px-4 sm:px-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <BankAccountCard
                key={account.id}
                accountHolder={account.accountHolderName}
                accountNumber={account.accountNumber}
                bankName={account.bankName}
                onEdit={() => handleEditAccount(account)}
                onDelete={() => handleDeleteAccount(account)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">No bank accounts added yet</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Add Your First Account
              </Button>
            </div>
          )}
        </div>

        {/* Add/Edit Bank Account Modal */}
        {isModalOpen && (
          <AddBankAccountModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleAddAccount}
            initialData={
              editingAccount
                ? {
                    accountHolderName: editingAccount.accountHolderName,
                    bankName: editingAccount.bankName,
                    accountNumber: editingAccount.accountNumber.replace(/[X\s]/g, ''),
                    routingNumber: editingAccount.routingNumber,
                    swiftCode: editingAccount.swiftCode,
                    accountType: editingAccount.accountType,
                  }
                : undefined
            }
            isEdit={!!editingAccount}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Delete Bank Account?"
            description={`Are you sure you want to delete the bank account ending in ${accountToDelete?.accountNumber.slice(-4)}? This action cannot be undone.`}
            confirmText="Yes, I'm Sure"
            cancelText="Cancel"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ManageBankAccountsPage;
