import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddCardModalStripe } from '../components/AddCardModalStripe';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { Plus } from 'lucide-react';
import ManageBankAccountsSkeleton from '../components/ManageBankAccountsSkeleton';
import { Card as UICard, CardContent } from '@/components/ui/Card';
import { Card, CreateCardWithTokenPayload } from '../services/cardService';
import {
  useCardsQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useSetDefaultCardMutation,
} from '../hooks/useCardMutations';
import { SavedCard } from '../components/SavedCard';
import { EmptyState } from '@/components/common/EmptyState';
import CardEmptyIcon from '@/assets/svg/cardEmptyState.svg';

const ManageSavedCardsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);

  // Queries
  const { data: cardsData, isLoading, error } = useCardsQuery();

  // Mutations
  const createMutation = useCreateCardMutation();
  const updateMutation = useUpdateCardMutation();
  const deleteMutation = useDeleteCardMutation();
  const setDefaultMutation = useSetDefaultCardMutation();

  const cards = cardsData?.data || [];

  const handleToggleDefault = async (cardId: string, isDefault: boolean) => {
    if (isDefault) {
      // Set this card as default
      await setDefaultMutation.mutateAsync(cardId);
    } else {
      // Update card to remove default status
      const card = cards.find((c: Card) => c.id === cardId);
      if (card) {
        await updateMutation.mutateAsync({
          id: cardId,
          data: {
            isDefault: false,
          },
        });
      }
    }
  };

  const handleAddCard = async (data: {
    token: string;
    cardholderName: string;
    isDefault: boolean;
  }) => {
    try {
      if (editingCard) {
        await updateMutation.mutateAsync({
          id: editingCard.id,
          data: {
            cardholderName: data.cardholderName,
            isDefault: data.isDefault,
          },
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      // Only close modal on success
      setIsModalOpen(false);
      setEditingCard(null);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      // Modal stays open so user can retry or fix the issue
      console.error('Failed to save card:', error);
    }
  };

  // const handleEditCard = (card: Card) => {
  //   setEditingCard(card);
  //   setIsModalOpen(true);
  // };

  const handleDeleteCard = (card: Card) => {
    setCardToDelete(card);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (cardToDelete) {
      deleteMutation.mutate(cardToDelete?._id || '', {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setCardToDelete(null);
        },
      });
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCardToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  };

  if (isLoading) {
    return <ManageBankAccountsSkeleton />;
  }

  if (error) {
    return (
      <UICard className="bg-white border-gray-200 shadow-none h-[calc(100vh-200px)] justify-center items-center">
        <CardContent className="px-4 sm:px-6">
          <div className="text-center py-12 text-red-500">
            Failed to load cards. Please try again.
          </div>
        </CardContent>
      </UICard>
    );
  }

  return (
    <UICard className="bg-white border-gray-200 shadow-none min-h-[calc(100vh-200px)] flex flex-col">
      <CardContent className="px-4 sm:px-6 flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Manage Saved Cards</h2>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto min-w-full sm:min-w-[180px] h-10 sm:h-11 bg-primary hover:bg-primary/90 text-white px-3 sm:px-5 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 ">
          {cards?.length > 0 ? (
            cards?.map((card: Card) => {
              const expiryDate = `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}`;
              return (
                <SavedCard
                  key={card.id}
                  id={card?._id || ''}
                  totalCards={cards.length > 0 ? true : false}
                  accountHolder={card.cardholderName}
                  accountNumber={`**** **** **** ${card.last4}`}
                  bankName={card.brand.toUpperCase()}
                  expiryDate={expiryDate}
                  // onEdit={() => handleEditCard(card)}
                  onDelete={() => handleDeleteCard(card)}
                  onToggleDefault={handleToggleDefault}
                  isDefault={card.isDefault}
                  isCard={true}
                />
              );
            })
          ) : (
            <div className="col-span-full">
              <EmptyState
                title="No cards added yet"
                description="Add your payment card for quick and secure checkout"
                icon={<img src={CardEmptyIcon} className="w-64 h-56" />}
                action={{
                  label: 'Add Card',
                  onClick: () => setIsModalOpen(true)
                }}
                className="min-h-[400px]"
              />
            </div>
          )}
        </div>

        {/* Add/Edit Card Modal */}
        <AddCardModalStripe
          isOpen={isModalOpen}
          isSubmitting={createMutation.isPending || updateMutation?.isPending}
          onClose={handleCloseModal}
          onSubmit={handleAddCard}
          totalCards={cards.length > 0}
          initialData={
            editingCard
              ? {
                  cardholderName: editingCard.cardholderName,
                  isDefault: editingCard.isDefault,
                }
              : undefined
          }
          isEdit={!!editingCard}
        />

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Delete Card?"
            description={
              <>
                Are you sure you want to delete the card ending in{' '}
                <strong className="font-semibold">****{cardToDelete?.last4}</strong>? This action
                cannot be undone.
              </>
            }
            confirmText="Yes, I'm Sure"
            cancelText="Cancel"
            isLoading={deleteMutation.isPending}
          />
        )}
      </CardContent>
    </UICard>
  );
};

export default ManageSavedCardsPage;
