const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all roles
router.get('/', auth, async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { created_at: 'asc' }
    });
    
    // Add user count and permissions for each role
    const rolesWithCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await prisma.user.count({
          where: { role_id: role.id }
        });
        
        // Get permissions for this role
        const rolePermissions = await prisma.rolePermission.findMany({
          where: { role_id: role.id },
          select: { permission: true }
        });
        
        const permissions = rolePermissions.map(rp => rp.permission);
        
        return {
          ...role,
          userCount,
          permissions,
          createdAt: role.created_at,
          updatedAt: role.updated_at
        };
      })
    );
    
    res.json(rolesWithCount);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Create new role
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, permissions = [] } = req.body;

    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        isSystem: false,
        updated_at: new Date()
      }
    });

    // Add permissions if provided
    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map(permission => ({
          role_id: newRole.id,
          permission
        }))
      });
    }

    res.status(201).json({
      ...newRole,
      userCount: 0,
      permissions,
      createdAt: newRole.created_at,
      updatedAt: newRole.updated_at
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update role
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions = [] } = req.body;

    const existingRole = await prisma.role.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    if (existingRole.isSystem) {
      return res.status(400).json({ error: 'Cannot modify system roles' });
    }

    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        updated_at: new Date()
      }
    });

    // Update permissions
    await prisma.rolePermission.deleteMany({
      where: { role_id: parseInt(id) }
    });
    
    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map(permission => ({
          role_id: parseInt(id),
          permission
        }))
      });
    }

    res.json({
      ...updatedRole,
      userCount: 0,
      permissions,
      createdAt: updatedRole.created_at,
      updatedAt: updatedRole.updated_at
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete role
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    if (role.isSystem) {
      return res.status(400).json({ error: 'Cannot delete system roles' });
    }

    const userCount = await prisma.user.count({
      where: { role_id: parseInt(id) }
    });

    if (userCount > 0) {
      return res.status(400).json({ error: 'Cannot delete role with assigned users' });
    }

    await prisma.role.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// Get role by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const userCount = await prisma.user.count({
      where: { role_id: role.id }
    });

    // Get permissions for this role
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role_id: role.id },
      select: { permission: true }
    });
    
    const permissions = rolePermissions.map(rp => rp.permission);

    res.json({
      ...role,
      userCount,
      permissions,
      createdAt: role.created_at,
      updatedAt: role.updated_at
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

module.exports = router;