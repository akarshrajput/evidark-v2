"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X, Crop, Loader2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import supabase from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePictureUpload({ user, onProfileUpdate, isCurrentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cropData, setCropData] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const { user: currentUser } = useAuth();

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const resizeImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const uploadToSupabase = async (file) => {
    try {
      // Resize image before upload
      const resizedFile = await resizeImage(file);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user._id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, resizedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (photoUrl) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

      const response = await fetch(`${baseUrl}/api/v1/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photo: photoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Upload to Supabase
      const photoUrl = await uploadToSupabase(selectedFile);
      
      // Update user profile in backend
      const updatedUser = await updateUserProfile(photoUrl);
      
      // Update parent component
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }

      toast.success("Profile picture updated successfully!");
      handleClose();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCropData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!user.photo) return;

    setUploading(true);
    try {
      // Update user profile to remove photo
      const updatedUser = await updateUserProfile('');
      
      // Update parent component
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }

      toast.success("Profile picture removed successfully!");
      handleClose();
    } catch (error) {
      console.error('Remove failed:', error);
      toast.error("Failed to remove profile picture");
    } finally {
      setUploading(false);
    }
  };

  if (!isCurrentUser) return null;

  return (
    <>
      {/* Edit Button Overlay */}
      <div className="relative group">
        <Avatar className="w-24 h-24 border-4 border-primary/20">
          <AvatarImage src={user.photo} alt={user.name} />
          <AvatarFallback className="text-2xl">
            {user.name?.[0] || user.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        
        {/* Edit Overlay */}
        <button
          onClick={() => setIsOpen(true)}
          className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Upload Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-[#111113] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Update Profile Picture</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Photo */}
            <div className="flex justify-center">
              <Avatar className="w-32 h-32 border-4 border-primary/20">
                <AvatarImage src={previewUrl || user.photo} alt={user.name} />
                <AvatarFallback className="text-4xl">
                  {user.name?.[0] || user.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Upload Area */}
            {!selectedFile && (
              <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">
                  Drag and drop your photo here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, GIF up to 5MB
                </p>
              </div>
            )}

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Selected File Info */}
            {selectedFile && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {selectedFile ? (
                <>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Save Photo
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Choose Different
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Photo
                  </Button>
                  {user.photo && (
                    <Button
                      onClick={handleRemovePhoto}
                      disabled={uploading}
                      variant="outline"
                      className="border-red-600/60 text-red-400 hover:bg-red-900/50"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
