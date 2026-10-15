/**
 * 댕댕이 땅따먹기 대결! (Puppy Land Game) Main Script
 * - 매 판마다 50% 확률로 선공 순서 무작위 결정 (뽀송이 🎲 몽실이)
 * - 각 칸마다 1점뿐 아니라 2점, 3점, 4점, 그리고 마이너스 함정(-1점, -2점)까지 완전 랜덤 복불복!
 * - 가끔 등장하는 '🎲 행운의 주사위 찬스'로 연속 2~3칸 차지!
 * - 무작위 장애물 (바위, 물웅덩이, 새침한 고양이, 가시풀)
 * - 승패를 예측할 수 없는 반전의 지능형 AI 대결
 */

document.addEventListener('DOMContentLoaded', () => {
  // ========================================================
  // DOM 요소 캐싱
  // ========================================================
  const gameBoard = document.getElementById('gameBoard');
  const userScoreEl = document.getElementById('userScore');
  const botScoreEl = document.getElementById('botScore');
  const userCard = document.getElementById('userCard');
  const botCard = document.getElementById('botCard');
  const userFirstPill = document.getElementById('userFirstPill');
  const botFirstPill = document.getElementById('botFirstPill');
  const userTilesSub = document.getElementById('userTilesSub');
  const botTilesSub = document.getElementById('botTilesSub');
  const roundTag = document.getElementById('roundTag');
  const firstTurnTag = document.getElementById('firstTurnTag');
  const turnText = document.getElementById('turnText');
  const botThinkingBanner = document.getElementById('botThinkingBanner');
  
  // 주사위 이벤트 배너 요소
  const diceEventBanner = document.getElementById('diceEventBanner');
  const diceHeadline = document.getElementById('diceHeadline');
  const diceSubtext = document.getElementById('diceSubtext');
  const diceTotalPips = document.getElementById('diceTotalPips');
  const diceRemainPips = document.getElementById('diceRemainPips');

  const userPercentEl = document.getElementById('userPercent');
  const botPercentEl = document.getElementById('botPercent');
  const remainTilesEl = document.getElementById('remainTiles');
  const userFill = document.getElementById('userFill');
  const botFill = document.getElementById('botFill');

  const boardSizeSelect = document.getElementById('boardSizeSelect');
  const resetBtn = document.getElementById('resetBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');

  // 모달 요소
  const resultModal = document.getElementById('resultModal');
  const modalResultTitle = document.getElementById('modalResultTitle');
  const modalResultDesc = document.getElementById('modalResultDesc');
  const resultCharacter = document.getElementById('resultCharacter');
  const modalUserScore = document.getElementById('modalUserScore');
  const modalBotScore = document.getElementById('modalBotScore');
  const modalBadgeMsg = document.getElementById('modalBadgeMsg');
  const modalPlayAgainBtn = document.getElementById('modalPlayAgainBtn');
  const confettiCanvas = document.getElementById('confettiCanvas');

  // ========================================================
  // 게임 상태 변수
  // ========================================================
  let roundNumber = 1;
  let firstTurnPlayer = 'user'; // 'user' (뽀송이) or 'bot' (몽실이)
  let gridSize = parseInt(boardSizeSelect.value, 10) || 5;
  let totalTiles = gridSize * gridSize;
  
  // 타일 상태: null, 'user', 'bot', 'obstacle'
  let boardState = [];
  let obstacleIndices = new Set();
  let obstacleDetails = {}; // index -> { emoji, name }
  
  // 타일별 랜덤 점수 데이터 매핑: index -> { points, emoji, name, label, isMystery }
  let tileScoreData = {};

  let userScore = 0;
  let botScore = 0;
  let isUserTurn = true;
  let isGameOver = false;
  let isBotThinking = false;
  let lastUserMoveIndex = null;
  let confettiAnimationId = null;
  let botTurnTimeout = null;

  // 🎲 주사위 연속 찬스 상태
  let diceMovesRemaining = 1;
  let isDiceActive = false;

  // 장애물 종류 정의 (건널 수 없는 칸)
  const OBSTACLE_TYPES = [
    { emoji: '🪨', name: '바위' },
    { emoji: '💧', name: '웅덩이' },
    { emoji: '🐱', name: '야옹이' },
    { emoji: '🌵', name: '가시풀' }
  ];

  // 점수 풀 정의 (-2점부터 +4점까지)
  const SCORE_POOL = [
    { points: -2, emoji: '🐝', name: '말벌집', label: '-2점 감점!', desc: '벌에 쏘였어요! 아야!' },
    { points: -1, emoji: '💩', name: '지뢰똥', label: '-1점 감점!', desc: '으악! 똥을 밟았어요!' },
    { points: 1,  emoji: '🌿', name: '싱싱풀', label: '+1점', desc: '상쾌한 잔디밭!' },
    { points: 2,  emoji: '🍀', name: '행운풀', label: '+2점 찬스!', desc: '행운의 네잎클로버!' },
    { points: 3,  emoji: '🍖', name: '뼈다귀', label: '+3점 대박!', desc: '고소한 황금 뼈다귀!' },
    { points: 4,  emoji: '⭐', name: '황금별', label: '+4점 잭팟!', desc: '반짝이는 무지개 별!' }
  ];

  // ========================================================
  // 초기화 및 게임 리셋
  // ========================================================
  function initGame(isNewRound = false) {
    if (botTurnTimeout) {
      clearTimeout(botTurnTimeout);
      botTurnTimeout = null;
    }
    stopConfetti();

    if (isNewRound) {
      roundNumber++;
    }

    // 🎲 선공 순서 50% 완전 무작위 추첨!
    firstTurnPlayer = Math.random() < 0.5 ? 'user' : 'bot';
    isUserTurn = (firstTurnPlayer === 'user');

    gridSize = parseInt(boardSizeSelect.value, 10);
    totalTiles = gridSize * gridSize;
    boardState = Array(totalTiles).fill(null);
    obstacleIndices.clear();
    obstacleDetails = {};
    tileScoreData = {};
    lastUserMoveIndex = null;
    userScore = 0;
    botScore = 0;
    isGameOver = false;
    isBotThinking = false;
    diceMovesRemaining = 1;
    isDiceActive = false;

    // 모달 및 배너 닫기
    resultModal.classList.add('hidden');
    botThinkingBanner.classList.add('hidden');
    diceEventBanner.classList.add('hidden');

    // 1. 무작위 장애물 배치
    setupObstacles();

    // 2. 각 빈 타일에 무작위 점수(마이너스 포함!) 배정
    setupRandomTileScores();

    // 보드 그리드 렌더링
    renderBoard();

    // 상단 라운드 및 무작위 선공 뱃지 갱신
    updateRoundBadge();

    // UI 상태 갱신
    updateUI();

    // 선공 플레이어 출발
    if (firstTurnPlayer === 'bot') {
      startTurn('bot', true);
    } else {
      startTurn('user', true);
    }
  }

  // ========================================================
  // 턴 시작 처리 & 🎲 주사위 찬스 발동 체크
  // ========================================================
  function startTurn(player, isFirstMove = false) {
    if (isGameOver) return;

    const remainingEmpty = boardState.filter(s => s === null).length;
    diceMovesRemaining = 1;
    isDiceActive = false;

    // 🎲 주사위 찬스: 남은 빈 칸이 3칸 이상일 때 약 25% 확률
    const diceChance = isFirstMove ? 0.3 : 0.25;
    if (remainingEmpty >= 3 && Math.random() < diceChance) {
      const rolledMoves = Math.min(remainingEmpty, Math.random() < 0.65 ? 2 : 3);
      diceMovesRemaining = rolledMoves;
      isDiceActive = true;

      window.soundEngine.playDiceRoll();

      diceTotalPips.textContent = rolledMoves;
      diceRemainPips.textContent = rolledMoves;

      if (player === 'user') {
        diceHeadline.textContent = `🎲 뽀송이의 주사위 찬스 발동! (${rolledMoves}칸 연속!)`;
        diceSubtext.innerHTML = `주사위에서 <b>${rolledMoves}</b>가 나왔어요! 연속으로 <b>${rolledMoves}칸</b>을 골라요! (남은 횟수: <b id="diceRemainPips">${rolledMoves}</b>칸)`;
      } else {
        diceHeadline.textContent = `🎲 몽실이의 주사위 찬스 발동! (${rolledMoves}칸 연속!)`;
        diceSubtext.innerHTML = `몽실이가 주사위로 <b>${rolledMoves}칸</b>을 연달아 차지합니다!`;
      }

      diceEventBanner.classList.remove('hidden');
    } else {
      diceEventBanner.classList.add('hidden');
    }

    if (player === 'user') {
      isUserTurn = true;
      isBotThinking = false;
      updateUI();
    } else {
      isUserTurn = false;
      triggerBotTurnSeries(isFirstMove);
    }
  }

  // ========================================================
  // 무작위 장애물 생성 (건널 수 없는 바위/물웅덩이 등)
  // ========================================================
  function setupObstacles() {
    let count = 2;
    if (gridSize === 5) count = Math.random() < 0.5 ? 3 : 4;
    if (gridSize === 6) count = Math.random() < 0.5 ? 4 : 5;

    const available = Array.from({ length: totalTiles }, (_, i) => i);
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

    for (let i = 0; i < count; i++) {
      const idx = available.pop();
      obstacleIndices.add(idx);
      boardState[idx] = 'obstacle';
      const obsType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
      obstacleDetails[idx] = obsType;
    }
  }

  // ========================================================
  // 각 타일마다 무작위 점수(-2, -1, +1, +2, +3, +4) 배정!
  // ========================================================
  function setupRandomTileScores() {
    for (let i = 0; i < totalTiles; i++) {
      if (boardState[i] === 'obstacle') continue;

      const rand = Math.random();
      let scoreItem;

      // 확률 분포:
      //  6% : -2점 (말벌집 🐝)
      // 14% : -1점 (지뢰똥 💩)
      // 36% : +1점 (일반 잔디 🌿)
      // 26% : +2점 (행운풀 🍀)
      // 12% : +3점 (황금 뼈다귀 🍖)
      //  6% : +4점 (무지개 별 ⭐)
      if (rand < 0.06) {
        scoreItem = SCORE_POOL[0]; // -2
      } else if (rand < 0.20) {
        scoreItem = SCORE_POOL[1]; // -1
      } else if (rand < 0.56) {
        scoreItem = SCORE_POOL[2]; // +1
      } else if (rand < 0.82) {
        scoreItem = SCORE_POOL[3]; // +2
      } else if (rand < 0.94) {
        scoreItem = SCORE_POOL[4]; // +3
      } else {
        scoreItem = SCORE_POOL[5]; // +4
      }

      // 40% 확률로 밟기 전까지 모르는 '❓ 미스터리 잔디'로 위장!
      const isMystery = Math.random() < 0.4;

      tileScoreData[i] = {
        ...scoreItem,
        isMystery: isMystery
      };
    }
  }

  // ========================================================
  // 보드판 렌더링
  // ========================================================
  function renderBoard() {
    gameBoard.className = `game-board grid-${gridSize}`;
    gameBoard.innerHTML = '';

    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('button');
      tile.dataset.index = i;

      if (obstacleIndices.has(i)) {
        // 장애물 타일
        const obs = obstacleDetails[i];
        tile.className = 'tile-cell tile-obstacle';
        tile.setAttribute('aria-label', `장애물: ${obs.name}`);
        tile.innerHTML = `
          <span class="tile-stamp">${obs.emoji}</span>
          <span class="obstacle-tag">${obs.name}</span>
        `;
        tile.addEventListener('click', () => handleObstacleClick(tile, obs));
      } else {
        // 모든 빈 잔디 타일은 점수를 철저히 숨긴 비밀 잔디밭!
        tile.className = 'tile-cell empty';
        tile.setAttribute('aria-label', `${i + 1}번째 잔디 칸 (비밀 점수)`);
        tile.innerHTML = ''; // 점수나 힌트를 일절 표시하지 않음!
        tile.addEventListener('click', () => handleTileClick(i));
      }

      gameBoard.appendChild(tile);
    }
  }

  // ========================================================
  // 장애물 클릭 시 반응 (흔들림 + 안내 소리)
  // ========================================================
  function handleObstacleClick(tile, obs) {
    window.soundEngine.playBlocked();
    tile.classList.remove('shake-anim');
    void tile.offsetWidth;
    tile.classList.add('shake-anim');

    turnText.textContent = `🚧 앗! ${obs.name}(은)는 건널 수 없어요!`;
    setTimeout(() => {
      if (!isGameOver) {
        updateTurnMessage();
      }
    }, 1200);
  }

  // ========================================================
  // 사용자 클릭 핸들러
  // ========================================================
  function handleTileClick(index) {
    if (isGameOver || !isUserTurn || isBotThinking) return;
    if (boardState[index] !== null) return;

    lastUserMoveIndex = index;
    const scoreItem = tileScoreData[index] || { points: 1, emoji: '🐾', name: '잔디' };

    // 사용자 영역 점유 & 점수 가감 (마이너스 점수 반영!)
    claimTile(index, 'user', scoreItem);

    // 사운드 및 플로팅 점수 연출
    if (scoreItem.points < 0) {
      if (window.soundEngine?.playTrap) window.soundEngine.playTrap();
      showFloatingScore(index, `${scoreItem.points}점 ${scoreItem.emoji}`, true);
      turnText.textContent = `💥 으악! ${scoreItem.desc} (${scoreItem.points}점 감점!)`;
    } else if (scoreItem.points >= 3) {
      if (window.soundEngine?.playJackpot) window.soundEngine.playJackpot();
      showFloatingScore(index, `+${scoreItem.points}점!`, false);
    } else if (scoreItem.points === 2) {
      if (window.soundEngine?.playBonus) window.soundEngine.playBonus();
      showFloatingScore(index, `+2점!`, false);
    } else {
      if (window.soundEngine?.playUserStamp) window.soundEngine.playUserStamp();
      showFloatingScore(index, '+1점', false);
    }

    diceMovesRemaining--;

    const remainEl = document.getElementById('diceRemainPips');
    if (remainEl) remainEl.textContent = Math.max(0, diceMovesRemaining);

    updateUI();

    // 게임 종료 확인
    if (checkGameOver()) {
      finishGame();
      return;
    }

    // 주사위 연속 찬스 남았을 때 사용자 턴 유지
    if (diceMovesRemaining > 0) {
      setTimeout(() => {
        if (!isGameOver) {
          turnText.textContent = `🎲 주사위 보너스! 한 번 더 터치하세요! (남은 횟수: ${diceMovesRemaining}칸) 🐾`;
        }
      }, 700);
      return;
    }

    // 주사위 배너 닫고 컴퓨터 턴으로 전환
    diceEventBanner.classList.add('hidden');
    startTurn('bot', false);
  }

  // ========================================================
  // 타일 점유 처리 함수 (사용자 / 컴퓨터)
  // 고르는 판의 점수는 안 보이고 오직 뽀송이/몽실이 발도장만 깔끔하게 찍힘!
  // ========================================================
  function claimTile(index, owner, scoreItem) {
    boardState[index] = owner;
    const tile = gameBoard.children[index];
    if (!tile) return;

    tile.classList.remove('empty', 'just-selected', 'tile-bonus');

    const points = scoreItem.points;

    if (owner === 'user') {
      userScore += points;
      tile.classList.add('claimed-user');
      tile.setAttribute('aria-label', `${index + 1}번째 칸: 뽀송이 영역`);

      tile.innerHTML = `
        <span class="tile-stamp">🐾</span>
        <span class="tile-owner-tag">뽀송이</span>
      `;
    } else {
      botScore += points;
      tile.classList.add('claimed-bot', 'just-selected');
      tile.setAttribute('aria-label', `${index + 1}번째 칸: 몽실이 영역`);

      tile.innerHTML = `
        <span class="tile-stamp">🐾</span>
        <span class="tile-owner-tag">몽실이</span>
      `;
      setTimeout(() => {
        tile.classList.remove('just-selected');
      }, 350);
    }
  }

  // ========================================================
  // 점수 획득/감점 플로팅 텍스트
  // ========================================================
  function showFloatingScore(tileIndex, text, isMinus = false) {
    const tile = gameBoard.children[tileIndex];
    if (!tile) return;

    const floatEl = document.createElement('div');
    floatEl.className = `score-pop-float ${isMinus ? 'minus' : ''}`;
    floatEl.textContent = text;
    tile.appendChild(floatEl);

    setTimeout(() => {
      if (floatEl.parentNode) {
        floatEl.parentNode.removeChild(floatEl);
      }
    }, 950);
  }

  // ========================================================
  // 컴퓨터(AI) 주사위 연속 턴 & 선택 처리
  // ========================================================
  function triggerBotTurnSeries(isFirstMove = false) {
    isUserTurn = false;
    isBotThinking = true;
    updateUI();

    botThinkingBanner.classList.remove('hidden');

    function executeNextBotStep() {
      if (isGameOver) return;

      try {
        const emptyIndices = [];
        for (let i = 0; i < totalTiles; i++) {
          if (boardState[i] === null) emptyIndices.push(i);
        }

        if (emptyIndices.length === 0) {
          finishGame();
          return;
        }

        // 스마트 AI 수 선택
        const chosenIndex = chooseSmartBotMove(emptyIndices);
        const scoreItem = tileScoreData[chosenIndex] || { points: 1, emoji: '🐾', name: '잔디' };

        claimTile(chosenIndex, 'bot', scoreItem);

        if (scoreItem.points < 0) {
          if (window.soundEngine?.playTrap) window.soundEngine.playTrap();
          showFloatingScore(chosenIndex, `${scoreItem.points}점 ${scoreItem.emoji}`, true);
          turnText.textContent = `🐕 몽실이가 ${scoreItem.name}을(를) 밟아 ${scoreItem.points}점 감점!`;
        } else if (scoreItem.points >= 3) {
          if (window.soundEngine?.playJackpot) window.soundEngine.playJackpot();
          showFloatingScore(chosenIndex, `+${scoreItem.points}점!`, false);
        } else if (scoreItem.points === 2) {
          if (window.soundEngine?.playBonus) window.soundEngine.playBonus();
          showFloatingScore(chosenIndex, `+2점!`, false);
        } else {
          if (window.soundEngine?.playBotStamp) window.soundEngine.playBotStamp();
          showFloatingScore(chosenIndex, '+1점', false);
        }

        diceMovesRemaining--;
        updateUI();

        if (checkGameOver()) {
          finishGame();
          return;
        }

        // 주사위 찬스로 남은 몽실이 수가 있다면 다음 칸 선택 (초고속 200ms 연속 진행)
        if (diceMovesRemaining > 0) {
          const remainEl = document.getElementById('diceRemainPips');
          if (remainEl) remainEl.textContent = diceMovesRemaining;

          botTurnTimeout = setTimeout(executeNextBotStep, 200);
          return;
        }
      } catch (err) {
        console.error('Error during bot step:', err);
      }

      // 몽실이 턴 완료 -> 주사위 배너 닫고 반드시 사용자 턴으로 안전 복구!
      botThinkingBanner.classList.add('hidden');
      diceEventBanner.classList.add('hidden');
      isBotThinking = false;
      startTurn('user', false);
    }

    // 선택 시간이 길지 않도록 0.18초 ~ 0.28초로 쾌속 처리!
    const initialDelay = isFirstMove ? 300 : Math.floor(Math.random() * 100) + 180;
    botTurnTimeout = setTimeout(executeNextBotStep, initialDelay);
  }

  // ========================================================
  // 몽실이 AI 수 선택 (블라인드 탐색 & 인접 견제 & 무작위 복불복)
  // ========================================================
  function chooseSmartBotMove(emptyIndices) {
    // 판의 점수가 비밀이므로 몽실이도 점수를 모른 채 공평하게 플레이합니다!
    // 1. 30% 확률로 뽀송이가 방금 차지한 땅의 인접한 빈 칸을 견제
    if (lastUserMoveIndex !== null && Math.random() < 0.3) {
      const neighbors = getNeighbors(lastUserMoveIndex);
      const validEmptyNeighbors = neighbors.filter(idx => emptyIndices.includes(idx));
      if (validEmptyNeighbors.length > 0) {
        return validEmptyNeighbors[Math.floor(Math.random() * validEmptyNeighbors.length)];
      }
    }

    // 2. 그 외에는 완전 무작위 선택! (몽실이도 똥을 밟을 수도, 대박을 칠 수도 있음!)
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  function getNeighbors(idx) {
    const r = Math.floor(idx / gridSize);
    const c = idx % gridSize;
    const result = [];
    if (r > 0) result.push((r - 1) * gridSize + c);
    if (r < gridSize - 1) result.push((r + 1) * gridSize + c);
    if (c > 0) result.push(r * gridSize + (c - 1));
    if (c < gridSize - 1) result.push(r * gridSize + (c + 1));
    return result;
  }

  // ========================================================
  // 게임 종료 판정
  // ========================================================
  function checkGameOver() {
    const remainingEmpty = boardState.filter(state => state === null).length;
    return remainingEmpty === 0;
  }

  // ========================================================
  // 결과 발표 및 모달 표시
  // ========================================================
  function finishGame() {
    isGameOver = true;
    diceEventBanner.classList.add('hidden');
    botThinkingBanner.classList.add('hidden');
    updateUI();

    modalUserScore.textContent = `${userScore}점`;
    modalBotScore.textContent = `${botScore}점`;

    let title = '';
    let desc = '';
    let character = '';
    let badge = '';

    if (userScore > botScore) {
      title = '🎉 뽀송이의 짜릿한 승리! 🏆';
      desc = `대단해요! 뽀송이가 마이너스 함정을 뚫고 총 ${userScore}점으로 마당을 정복했어요!`;
      character = '🐶👑';
      badge = '🍖 특제 황금 뼈다귀 트로피 획득!';
      window.soundEngine.playVictory();
      startConfetti();
    } else if (userScore < botScore) {
      title = '🐾 몽실이의 대역전 승리! 🐕';
      desc = `아쉬워요! 몽실이가 총 ${botScore}점으로 마당의 대장이 되었어요!`;
      character = '🐕💨';
      badge = '🍪 아쉬움을 달래줄 달콤한 개껌 증정!';
      window.soundEngine.playDefeat();
    } else {
      title = '🤝 팽팽한 무승부! 🐾';
      desc = `동점(${userScore}점 vs ${botScore}점)이에요! 둘 다 최고의 복불복 달견!`;
      character = '🐶🤝🐕';
      badge = '🎾 함께 나누는 우정의 테니스공 획득!';
      window.soundEngine.playDraw();
    }

    modalResultTitle.textContent = title;
    modalResultDesc.textContent = desc;
    resultCharacter.textContent = character;
    modalBadgeMsg.textContent = badge;

    setTimeout(() => {
      resultModal.classList.remove('hidden');
    }, 450);
  }

  // ========================================================
  // 상단 라운드 및 무작위 선공 뱃지 업데이트
  // ========================================================
  function updateRoundBadge() {
    roundTag.textContent = `Round ${roundNumber}`;
    if (firstTurnPlayer === 'user') {
      firstTurnTag.textContent = '🎲 랜덤 선공: 뽀송이 (나) ⭐';
      userFirstPill.classList.remove('hidden');
      botFirstPill.classList.add('hidden');
    } else {
      firstTurnTag.textContent = '🎲 랜덤 선공: 몽실이 (컴퓨터) ⭐';
      userFirstPill.classList.add('hidden');
      botFirstPill.classList.remove('hidden');
    }
  }

  // ========================================================
  // 턴 안내 문구 업데이트
  // ========================================================
  function updateTurnMessage() {
    if (isGameOver) {
      turnText.textContent = '게임 종료! 결과를 확인하세요 🐾';
    } else if (isUserTurn) {
      if (diceMovesRemaining > 1) {
        turnText.textContent = `🎲 주사위 찬스! 연속 ${diceMovesRemaining}칸 선택 가능! 🐾`;
      } else {
        turnText.textContent = '내 차례! 빈 잔디를 터치해봐! 🐾';
      }
    } else {
      turnText.textContent = '몽실이가 냄새 맡으며 고르는 중... 🐕';
    }
  }

  // ========================================================
  // UI 실시간 갱신 (스코어, 점유율 바, 턴 인디케이터)
  // ========================================================
  function updateUI() {
    // 점수 합계 갱신
    if (userScoreEl.textContent !== String(userScore)) {
      userScoreEl.textContent = userScore;
      userScoreEl.classList.remove('score-bump');
      void userScoreEl.offsetWidth;
      userScoreEl.classList.add('score-bump');
    }
    if (botScoreEl.textContent !== String(botScore)) {
      botScoreEl.textContent = botScore;
      botScoreEl.classList.remove('score-bump');
      void botScoreEl.offsetWidth;
      botScoreEl.classList.add('score-bump');
    }

    const claimableTotal = totalTiles - obstacleIndices.size;
    const remainingEmpty = boardState.filter(s => s === null).length;
    remainTilesEl.textContent = remainingEmpty;

    const userTilesCount = boardState.filter(s => s === 'user').length;
    const botTilesCount = boardState.filter(s => s === 'bot').length;

    // 차지한 칸 수 서브라벨 갱신
    if (userTilesSub) userTilesSub.textContent = `${userTilesCount}칸 차지`;
    if (botTilesSub) botTilesSub.textContent = `${botTilesCount}칸 차지`;

    const userPercent = claimableTotal > 0 ? Math.round((userTilesCount / claimableTotal) * 100) : 0;
    const botPercent = claimableTotal > 0 ? Math.round((botTilesCount / claimableTotal) * 100) : 0;

    userPercentEl.textContent = `${userPercent}%`;
    botPercentEl.textContent = `${botPercent}%`;

    userFill.style.width = `${userPercent}%`;
    botFill.style.width = `${botPercent}%`;

    if (isGameOver) {
      userCard.classList.remove('active');
      botCard.classList.remove('active');
    } else if (isUserTurn) {
      userCard.classList.add('active');
      botCard.classList.remove('active');
    } else {
      userCard.classList.remove('active');
      botCard.classList.add('active');
    }

    updateTurnMessage();
  }

  // ========================================================
  // 컨페티(꽃가루 파티클) 시스템
  // ========================================================
  function startConfetti() {
    const canvas = confettiCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.offsetWidth || 400;
    const height = canvas.height = canvas.parentElement.offsetHeight || 400;

    const particles = [];
    const colors = ['#ff9800', '#ffeb3b', '#4caf50', '#00bcd4', '#e91e63', '#9c27b0'];
    const emojis = ['🐾', '🦴', '🌸', '⭐', '✨', '🎲', '🍀'];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: -Math.random() * height * 0.5,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: Math.random() > 0.6 ? emojis[Math.floor(Math.random() * emojis.length)] : null,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 8
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.emoji) {
          ctx.font = `${p.size + 8}px sans-serif`;
          ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        }

        ctx.restore();
      });

      confettiAnimationId = requestAnimationFrame(render);
    }

    render();
  }

  function stopConfetti() {
    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId);
      confettiAnimationId = null;
    }
    const canvas = confettiCanvas;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ========================================================
  // 이벤트 바인딩
  // ========================================================
  // 새 게임 (무작위 선공 & 리셋하여 다음 라운드)
  resetBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    initGame(true);
  });

  // 모달 안의 한 판 더 대결 버튼
  modalPlayAgainBtn.addEventListener('click', () => {
    window.soundEngine.playClick();
    initGame(true);
  });

  // 보드 크기 선택 변경
  boardSizeSelect.addEventListener('change', () => {
    window.soundEngine.playClick();
    roundNumber = 1;
    initGame(false);
  });

  // 사운드 토글
  soundToggleBtn.addEventListener('click', () => {
    const isMuted = window.soundEngine.toggleMute();
    if (isMuted) {
      soundIcon.textContent = '🔇';
      soundText.textContent = '소리 끔';
    } else {
      soundIcon.textContent = '🔊';
      soundText.textContent = '소리 켬';
      window.soundEngine.playClick();
    }
  });

  // 게임 최초 시작 (Round 1)
  initGame(false);
});
