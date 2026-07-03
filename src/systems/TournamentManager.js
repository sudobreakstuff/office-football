export class TournamentManager {
  constructor() {
    this.players = [];
    this.bracket = null;
    this.currentRound = 0;
    this.status = 'waiting';
    this.code = this.generateCode();
    this.matches = [];
    this.matchResults = [];
  }

  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  addPlayer(name, character = null) {
    if (this.status !== 'waiting') return false;
    if (this.players.find((p) => p.name === name)) return false;
    this.players.push({ name, character, seed: this.players.length });
    return true;
  }

  removePlayer(name) {
    const idx = this.players.findIndex((p) => p.name === name);
    if (idx > -1) {
      this.players.splice(idx, 1);
      this.players.forEach((p, i) => (p.seed = i));
    }
  }

  startTournament() {
    if (this.players.length < 4 || this.players.length > 32) return false;

    const size = this.getBracketSize(this.players.length);

    this.bracket = this.generateBracket(size);
    this.seedPlayers(size);
    this.status = 'in_progress';
    this.currentRound = 0;
    return true;
  }

  getBracketSize(count) {
    const sizes = [4, 8, 16, 32];
    for (const s of sizes) {
      if (count <= s) return s;
    }
    return 32;
  }

  generateBracket(size) {
    const rounds = Math.log2(size);
    const bracket = [];
    for (let r = 0; r < rounds; r++) {
      const matchesInRound = size / Math.pow(2, r + 1);
      const round = [];
      for (let m = 0; m < matchesInRound; m++) {
        round.push({
          player1: null,
          player2: null,
          winner: null,
          score: null,
          roomCode: null,
          status: 'pending',
          round: r,
          position: m,
        });
      }
      bracket.push(round);
    }
    return bracket;
  }

  seedPlayers(size) {
    const shuffle = [...this.players].sort(() => Math.random() - 0.5);
    const firstRound = this.bracket[0];

    for (let i = 0; i < firstRound.length; i++) {
      if (i < shuffle.length) {
        firstRound[i].player1 = shuffle[i];
        if (i + firstRound.length < shuffle.length) {
          firstRound[i].player2 = shuffle[i + firstRound.length];
        } else if (i + firstRound.length < shuffle.length * 2) {
          firstRound[i].player2 = null;
        }
      }
    }

    let nextToAssign = 0;
    for (const match of firstRound) {
      if (!match.player1) {
        if (nextToAssign < shuffle.length) {
          match.player1 = shuffle[nextToAssign++];
        }
      }
      if (!match.player2 && nextToAssign < shuffle.length) {
        match.player2 = shuffle[nextToAssign++];
      }
    }
  }

  reportMatchResult(roundIndex, matchIndex, winnerIdx, score) {
    const match = this.bracket[roundIndex][matchIndex];
    if (!match) return false;

    match.winner = winnerIdx === 0 ? match.player1 : match.player2;
    match.score = score;
    match.status = 'finished';

    this.matchResults.push({
      round: roundIndex,
      match: matchIndex,
      player1: match.player1?.name,
      player2: match.player2?.name,
      winner: match.winner?.name,
      score,
    });

    if (roundIndex + 1 < this.bracket.length) {
      const nextRound = this.bracket[roundIndex + 1];
      const nextIdx = Math.floor(matchIndex / 2);

      if (nextIdx < nextRound.length) {
        const nextMatch = nextRound[nextIdx];
        if (matchIndex % 2 === 0) {
          nextMatch.player1 = match.winner;
        } else {
          nextMatch.player2 = match.winner;
        }
        nextMatch.status = 'ready';
      }
    }

    return true;
  }

  getCurrentRoundMatches() {
    return this.bracket?.[this.currentRound] || [];
  }

  advanceRound() {
    const currentMatches = this.bracket[this.currentRound];
    const allDone = currentMatches.every((m) => m.status === 'finished');
    if (!allDone) return false;

    this.currentRound++;
    if (this.currentRound >= this.bracket.length) {
      this.status = 'finished';
      return false;
    }
    return true;
  }

  getWinner() {
    if (this.status !== 'finished') return null;
    const finalRound = this.bracket[this.bracket.length - 1];
    if (finalRound.length === 1) {
      return finalRound[0].winner;
    }
    return null;
  }

  getFinalists() {
    if (this.bracket.length < 2) return [];
    const finalRound = this.bracket[this.bracket.length - 1];
    if (finalRound.length >= 1) {
      return [finalRound[0].player1, finalRound[0].player2].filter(Boolean);
    }
    return [];
  }

  getBracketData() {
    return {
      players: this.players.map((p) => p.name),
      bracket: this.bracket,
      currentRound: this.currentRound,
      status: this.status,
      matchResults: this.matchResults,
    };
  }
}
