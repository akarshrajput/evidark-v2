"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/v1/categories");
      setCategories(res.data?.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      const res = await axios.post("/api/v1/categories", { name: name.trim(), description: description.trim() });
      toast.success("Category created");
      setName("");
      setDescription("");
      setCategories((prev) => [res.data.data, ...prev]);
    } catch (e) {
      const msg = e.response?.data?.error || "Failed to create category";
      toast.error(msg);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name || "");
    setEditDescription(cat.description || "");
  };

  const saveEdit = async () => {
    try {
      const res = await axios.patch(`/api/v1/categories/${editingId}`, {
        name: editName,
        description: editDescription,
      });
      toast.success("Category updated");
      setCategories((prev) => prev.map((c) => (c._id === editingId ? res.data.data : c)));
      setEditingId(null);
      setEditName("");
      setEditDescription("");
    } catch (e) {
      const msg = e.response?.data?.error || "Failed to update category";
      toast.error(msg);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`/api/v1/categories/${id}`);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      const msg = e.response?.data?.error || "Failed to delete category";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Horror" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={createCategory} className="bg-red-600 hover:bg-red-700">Add Category</Button>
            <Button variant="outline" onClick={fetchCategories}>Refresh</Button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat._id} className="p-4 border border-border rounded-md flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  {editingId === cat._id ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="font-medium">{cat.name}</div>
                      <div className="text-sm text-muted-foreground">{cat.description || "—"}</div>
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    {editingId === cat._id ? (
                      <>
                        <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700">Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEdit(cat)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteCategory(cat._id)}>Delete</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />
    </div>
  );
};

export default AdminCategories;
