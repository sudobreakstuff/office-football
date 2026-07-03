import { getSupabase } from './supabase.js';

export class RoomManager {
  constructor() {
    this.supabase = getSupabase();
    this.currentRoom = null;
    this.playerId = null;
    this.nickname = null;
    this.channel = null;
    this.onPlayerJoined = null;
    this.onPlayerLeft = null;
    this.onGameState = null;
    this.onRoomUpdate = null;
    this.error = null;
  }

  async createRoom(type = '1v1') {
    const code = this.generateCode();
    const { data, error } = await this.supabase
      .from('rooms')
      .insert({
        code,
        type,
        status: 'waiting',
        game_state: {},
      })
      .select()
      .single();

    if (error) {
      this.error = error.message;
      return null;
    }

    this.currentRoom = data;
    await this.joinChannel(code);
    return data;
  }

  async joinRoom(code) {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      this.error = error?.message || 'Room not found';
      return null;
    }

    if (data.status !== 'waiting') {
      this.error = 'Room already in progress';
      return null;
    }

    const players = await this.getRoomPlayers(data.id);
    const maxPlayers = data.type === '2v2' ? 4 : 2;
    if (players.length >= maxPlayers) {
      this.error = 'Room is full';
      return null;
    }

    this.currentRoom = data;
    await this.joinChannel(code);
    return data;
  }

  async addPlayer(nickname, character, team = 0) {
    if (!this.currentRoom) return null;

    const { data, error } = await this.supabase
      .from('room_players')
      .insert({
        room_id: this.currentRoom.id,
        nickname,
        character,
        team,
        ready: false,
      })
      .select()
      .single();

    if (error) {
      this.error = error.message;
      return null;
    }

    this.playerId = data.id;
    this.nickname = nickname;
    return data;
  }

  async setReady(ready = true) {
    if (!this.playerId) return;
    await this.supabase
      .from('room_players')
      .update({ ready })
      .eq('id', this.playerId);
  }

  async startGame(gameState) {
    if (!this.currentRoom) return;
    await this.supabase
      .from('rooms')
      .update({ status: 'playing', game_state: gameState || {} })
      .eq('id', this.currentRoom.id);
  }

  async updateGameState(state) {
    if (!this.currentRoom) return;
    await this.supabase
      .from('rooms')
      .update({ game_state: state })
      .eq('id', this.currentRoom.id);
  }

  async endRoom() {
    if (!this.currentRoom) return;
    await this.supabase
      .from('rooms')
      .update({ status: 'finished' })
      .eq('id', this.currentRoom.id);

    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  async getRoomPlayers(roomId) {
    const { data } = await this.supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId);
    return data || [];
  }

  async joinChannel(code) {
    this.channel = this.supabase
      .channel(`room:${code}`)
      .on('broadcast', { event: 'player_joined' }, (payload) => {
        if (this.onPlayerJoined) this.onPlayerJoined(payload.payload);
      })
      .on('broadcast', { event: 'player_left' }, (payload) => {
        if (this.onPlayerLeft) this.onPlayerLeft(payload.payload);
      })
      .on('broadcast', { event: 'game_state' }, (payload) => {
        if (this.onGameState) this.onGameState(payload.payload);
      })
      .on('broadcast', { event: 'room_update' }, (payload) => {
        if (this.onRoomUpdate) this.onRoomUpdate(payload.payload);
      })
      .subscribe();

    await this.channel.send({
      type: 'broadcast',
      event: 'player_joined',
      payload: { nickname: this.nickname },
    });
  }

  broadcast(event, payload) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  }

  async getActiveRooms() {
    const { data } = await this.supabase
      .from('rooms')
      .select('code, type, status, created_at')
      .eq('status', 'playing')
      .order('created_at', { ascending: false })
      .limit(20);
    return data || [];
  }

  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  destroy() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
    }
  }
}
