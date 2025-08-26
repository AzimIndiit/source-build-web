import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';

interface PersonalDetailsFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: string;
    region?: string;
    address?: string;
    description?: string;
    avatar?: string;
  };
  onSave?: (data: any) => void;
}

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  initialData = {
    firstName: 'Yousef',
    lastName: 'Alaoui',
    email: 'nikolhansen11@gmail.com',
    company: 'Johns. Pvt. Ltd.',
    region: 'USA',
    address: '70 Washington Square South, New York, United States',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vitae tellus eu dolor tincidunt imperdiet vel ut diam. Nulla a nulla varius, volutpat velit non, ullamcorper augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Maecenas sodales ultricies vulputate.'
  },
  onSave
}) => {
  const [formData, setFormData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave?.(formData);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    console.log('Change password clicked');
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Personal details</h2>

        {/* Avatar Section */}
        <div className="mb-8">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </Avatar>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full"
                placeholder="First Name"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full"
                placeholder="Last Name"
              />
            </div>
          </div>

          {/* Email and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full"
                placeholder="Email Address"
              />
            </div>
            <div>
              <Label htmlFor="company" className="text-sm font-medium text-gray-700 mb-2">
                Company Name
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full"
                placeholder="Company Name"
              />
            </div>
          </div>

          {/* Region and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="region" className="text-sm font-medium text-gray-700 mb-2">
                Region
              </Label>
              <Input
                id="region"
                type="text"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className="w-full"
                placeholder="Region"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2">
                Address
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full"
                placeholder="Address"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full min-h-[120px]"
              placeholder="Tell us about yourself..."
              rows={5}
            />
          </div>

          {/* Password Change Link */}
          <div className="pt-4">
            <button
              onClick={handleChangePassword}
              className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
            >
              Looking to change your password?
            </button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 rounded-lg font-medium text-base"
            >
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};