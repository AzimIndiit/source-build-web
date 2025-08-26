import React, { useState } from 'react';
import { ProfileLayout } from '../layouts/ProfileLayout';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { PersonalDetailsForm } from '../components/PersonalDetailsForm';

// Import other sections that can be added later
// import { MyEarnings } from '../components/MyEarnings';
// import { BankAccounts } from '../components/BankAccounts';
// import { TermsConditions } from '../components/TermsConditions';
// import { PrivacyPolicy } from '../components/PrivacyPolicy';
// import { ContactUs } from '../components/ContactUs';

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleSaveProfile = (data: any) => {
    console.log('Saving profile data:', data);
    // Here you would typically make an API call to save the data
  };

  // Render the appropriate section based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <PersonalDetailsForm onSave={handleSaveProfile} />;
      case 'earnings':
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">My Earnings</h2>
            <p className="text-gray-600">Earnings section coming soon...</p>
          </div>
        );
      case 'bank':
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Manage Bank Accounts</h2>
            <p className="text-gray-600">Bank accounts section coming soon...</p>
          </div>
        );
      case 'terms':
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>
            <p className="text-gray-600">Terms & Conditions content coming soon...</p>
          </div>
        );
      case 'privacy':
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
            <p className="text-gray-600">Privacy Policy content coming soon...</p>
          </div>
        );
      case 'contact':
        return (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-600">Contact form coming soon...</p>
          </div>
        );
      default:
        return <PersonalDetailsForm onSave={handleSaveProfile} />;
    }
  };

  const sidebar = (
    <ProfileSidebar
      activeItem={activeSection}
      onItemClick={handleSectionChange}
      user={{
        name: 'Yousef Alaoui',
        email: 'yousefalaoui@gmail.com'
      }}
    />
  );

  return (
    <ProfileLayout sidebar={sidebar}>
      {renderContent()}
    </ProfileLayout>
  );
};

export default ProfilePage;