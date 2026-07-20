import { Request, Response } from 'express';
import GroupSession from '../models/GroupSession.js';

export const getGroupSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const session = await GroupSession.findOne({ code });
    if (!session) {
      res.status(404).json({ message: `Group Session ${code} not found` });
      return;
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createGroupSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, members, items, manualList, sourceId } = req.body;
    
    // Check if code already exists
    let session = await GroupSession.findOne({ code });
    if (session) {
      res.status(400).json({ message: `Group Session code ${code} already exists` });
      return;
    }

    session = new GroupSession({
      code,
      members,
      items,
      manualList,
      updatedAtTimestamp: Date.now(),
      sourceId
    });

    const saved = await session.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateGroupSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const { members, items, manualList, sourceId } = req.body;

    const session = await GroupSession.findOne({ code });
    if (!session) {
      res.status(404).json({ message: `Group Session ${code} not found` });
      return;
    }

    if (members) session.members = members;
    if (items) session.items = items;
    if (manualList) session.manualList = manualList;
    if (sourceId) session.sourceId = sourceId;
    session.updatedAtTimestamp = Date.now();

    const saved = await session.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const joinGroupSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const { member, cartId, tone, sourceId } = req.body;

    const session = await GroupSession.findOne({ code });
    if (!session) {
      res.status(404).json({ message: `Group Session ${code} not found` });
      return;
    }

    if (session.members.length >= 3) {
      res.status(400).json({ message: 'Nhóm đã đủ 3 xe' });
      return;
    }

    if (session.members.some(m => m.cartId === cartId)) {
      res.status(400).json({ message: `${cartId} đã có người tham gia` });
      return;
    }

    session.members.push({ member, cartId, tone });
    session.sourceId = sourceId;
    session.updatedAtTimestamp = Date.now();

    const saved = await session.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const leaveGroupSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const { cartId, groupRole, sourceId } = req.body;

    const session = await GroupSession.findOne({ code });
    if (!session) {
      res.status(404).json({ message: `Group Session ${code} not found` });
      return;
    }

    if (groupRole === 'host') {
      // If host leaves, delete session
      await GroupSession.deleteOne({ code });
      res.json({ message: 'Group session ended by host', deleted: true });
      return;
    }

    // Member leaves
    session.members = session.members.filter(m => m.cartId !== cartId);
    if (session.members.length === 0) {
      await GroupSession.deleteOne({ code });
      res.json({ message: 'Group session ended because no members left', deleted: true });
      return;
    }

    session.sourceId = sourceId;
    session.updatedAtTimestamp = Date.now();
    const saved = await session.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
