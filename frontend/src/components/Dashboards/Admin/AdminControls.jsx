import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast.js';
import { Edit, Shield, Plus } from 'lucide-react';
import ProfileSettings from '../Creator/ProfileSettings';

const AdminControls = () => {
  const { toast } = useToast();
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const defaultImgURL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1763711531/default_pfp_w2lnen.jpg`;

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
    profile_image: defaultImgURL
  });

  const handleInputChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleAddAdmin = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetch(`${backendUrl}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Admin Added',
          description: `${newAdmin.username} has been added as an admin.`,
        });

        setNewAdmin({ username: '', email: '', password: '', role: 'admin' });
        setShowAddAdmin(false);
      } else {
        toast({
          title: 'Failed to Add Admin',
          description: data.Error || 'An unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="shadow-md rounded-2xl bg-transparent text-foreground border border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white font-semibold">Admin Accounts & Roles</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage admin users and their permissions
              </CardDescription>
            </div>

            <Button 
              variant="default" 
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="rounded-lg bg-green-700 hover:bg-green-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </div>
        </CardHeader>

        {/* Add Admin Form */}
        {showAddAdmin && (
          <CardContent className="border-t border-border/60 pt-6 space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="username"
                placeholder="Username"
                className=" border-border text-foreground"
                value={newAdmin.username}
                onChange={handleInputChange}
              />
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                className=" border-border text-foreground"
                value={newAdmin.email}
                onChange={handleInputChange}
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                className="border-border text-foreground"
                value={newAdmin.password}
                onChange={handleInputChange}
              />
            </div>

            <Button 
              onClick={handleAddAdmin} 
              className="w-full md:w-auto rounded-lg"
            >
              Add Admin
            </Button>
          </CardContent>
        )}

        {/* Admin List */}
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Example Admin Card */}
              <ProfileSettings />
            </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminControls;
