let canvas, textbox, gl, shader, batcher, assetManager, skeletonRenderer;
let mvp = new spine.webgl.Matrix4();

let lastFrameTime;
let initialLoadTimer;
let modelFrame;
let renderFrame;
let renderTimer;
let spineData;

let customScale = 1;
let positionX = 0;
let positionY = 0;
let targetFps = 60;
let bgmfile = './assets/audio/Midnight Trip.flac';
let bgmvolume = 0;
let bgm;
let bufferColor = [0.3, 0.3, 0.3];

let introAnimation, acceptingClick;
let dialogBox = false;
let currentVoiceline = 1;
let mouseSelect = -1;
let trackerID = -1;
let untrackerID = -1;
let EPointX, EPointY;
let TPoint, TEye;
let headpatOrigin;
let headpatCooldown = 0;
const headpatTarget = new spine.Vector2();
const headpatOffset = new spine.Vector2();
let flipped = false;

let transpose = 1;

let currentTracks = []; // 跟踪当前播放的音频
let interfaceLanguage = 'default';
let steamLanguage = '';
let subtitleLanguagePreference = 'auto';
window.selectedLanguage = 'English';
const subtitleLocales = {
	English: 'en',
	Chinese: 'zh-Hans',
	TraditionalChinese: 'zh-Hant',
	Japanese: 'ja',
	Korean: 'ko',
	Thai: 'th'
};

const CHARACTER = 'CH0063';
let modelResolution = '8k';
let loadingResolution;
let modelAtlases;
const HAS_A = { eye: false, point: true };

// Subtitles follow the Talk events in each Spine animation.

const AUDIO_DETAIL = [
	{
		dialog: {
			Japanese: [
				"何でみんな、そんなに海が好きなんだろう……って、ずっとそう思ってた。",
				"みんなは楽しそうだけど、私はどうしても好きになれなくて……"
			],
			English: [
				"Honestly, I've never understood people's fascination with the ocean.",
				"While everyone's having a good time, I've never felt the same way."
			],
			Chinese: [
				"为什么大家都那么喜欢大海呢？我一直在思考这个问题。",
				"虽然大家看起来都很开心……可我却无论如何都喜欢不起来……"
			],
			TraditionalChinese: [
				"為什麼大家，都那麼喜歡大海呢……我一直都這麼思考著。",
				"雖然大家看起來都很開心，但是我實在是沒辦法喜歡大海……"
			],
			Korean: [
				"어째서 모두들, 그렇게나 바다를 좋아하는 걸까 ……라고, 쭉 생각해왔어.",
				"다들 즐거워 보이지만…… 난 아무래도 좋아지지가 않아서……."
			],
			Thai: ["ฉันไม่ค่อยเข้าใจหรอก ว่าทำไมทุกคนถึงชอบทะเลกัน","ถึงทุกคนดูสนุกกันมาก… แต่ฉันเองไม่ได้รู้สึกแบบนั้นเลย"]
		}
	},
	{
		dialog: {
			Japanese: [
				"水の中はよく見えないし、足がつかないと不安だし……",
				"先生も、そう思ったことない？"
			],
			English: [
				"It's blurry underwater, and I get nervous when my feet can't touch the ground.",
				"Sensei, have you ever felt that way before?"
			],
			Chinese: [
				"水面下的东西都看不太清楚，脚踩不到底也让我觉得放不下心……",
				"老师不这么觉得吗？"
			],
			TraditionalChinese: [
				"在水裡會看不清楚，腳又無法著地，會令人不安……",
				"老師有沒有也這麼想過？"
			],
			Korean: [
				"물속은 제대로 보이지도 않고, 발도 바닥에 닿지 않으면 불안하고…….",
				"선생도, 그런 생각 해본 적 없어?"
			],
			Thai: ["ฉันรู้สึกกังวล เวลาที่เท้า ยันพื้นไม่ถึง หรือมองไม่เห็น ข้างใต้น้ำน่ะ","คุณครู ไม่เคยคิดแบบนั้นเหรอ?"]
		}
	},
	{
		dialog: {
			Japanese: [
				"特に夜の海は、まるで暗闇みたいに不気味で……",
				"見てるだけで吸い込まれそうで、好きになれなかったけど……"
			],
			English: [
				"I found it eerie... The way the sea was just a bottomless well at night.",
				"I hated how it felt like I'd be sucked in just looking at it."
			],
			Chinese: [
				"特别是晚上，大海简直就像巨大的黑洞一样……",
				"光是这样看着就有种要被吸进去的感觉……"
			],
			TraditionalChinese: [
				"特別是夜晚的大海，就像黑暗一樣，很陰森……",
				"光是注視著就好像會被吸進去，雖然沒辦法喜歡……"
			],
			Korean: [
				"특히 밤바다라는 건, 꼭 새카만 우물 같은 게 으스스해서……",
				"보고 있으면 빨려 들어갈 것만 같아, 도저히 좋아할 수 없었는데……."
			],
			Thai: ["โดยเฉพาะทะเลตอนกลางคืน ดูเหมือนบ่อน้ำขนาดใหญ่ ที่ไร้จุดสิ้นสุดเลย","เพียงแค่มองก็รู้สึกเหมือนว่า จะโดนดูดเข้าไป ฉันเลย ไม่ค่อยชอบเลย"]
		}
	},
	{
		dialog: {
			Japanese: [
				"でも……今は、みんなの気持ちが少しだけ分かった気がする。",
				"海って、こんなに綺麗だったのね。"
			],
			English: [
				"But, you know, I think I'm beginning to understand. At least a little bit.",
				"The ocean can be so beautiful."
			],
			Chinese: [
				"可是……现在我好像稍微明白一点……大家的心情了。",
				"大海，原来这么美啊。"
			],
			TraditionalChinese: [
				"不過……現在，好像能稍微，理解大家的心情了。",
				"原來大海，這麼美麗呀。"
			],
			Korean: [
				"하지만……. 이제는, 모두의 기분을 조금은 알 것 같아.",
				"바다라는 건 이렇게 예쁜 거였구나."
			],
			Thai: ["แต่ว่าตอนนี้ฉันเริ่มเข้าใจ ความรู้สึกทุกคนแล้วล่ะ","ว่าท้องทะเล มันสวยงามขนาดนี้นี่เอง"]
		}
	},
	{
		dialog: {
			Japanese: [
				"不思議……今まで、こんな風に思ったことなかったのに。",
				"ありがとう、先生。一緒にいてくれて……色んなことを、教えてくれて。"
			],
			English: [
				"Strange... I've never felt this way before.",
				"Thank you, Sensei...for being here with me. And for everything you've taught me."
			],
			Chinese: [
				"真是不可思议……我以前从来没这么想过。",
				"老师，谢谢你……陪在我的身边……教会了我这么多事。"
			],
			TraditionalChinese: [
				"真神奇……至今為止，明明沒有這麼想過。",
				"謝謝你，老師。陪伴在我身邊……教導我，各種事物。"
			],
			Korean: [
				"신기해……. 지금까지, 이런 식으로 생각해본 적 없었는데.",
				"고마워, 선생님. 함께 있어줘서…… ……여러가지를, 가르쳐주어서."
			],
			Thai: ["แปลกจังเลย จนถึงตอนนี้ ฉันไม่เคยคิดแบบนี้มาก่อนเลย","ขอบคุณนะคุณครู... ที่อยู่ด้วยกันในตอนนี้... แล้วก็ขอบคุณที่ช่วยสอนฉัน ในหลายๆ อย่าง"]
		}
	}
];


const HITBOX = {
	headpat: { xMin: 1450, xMax: 1900, yMin: 50, yMax: 350 },
	voiceline: { xMin: 1320, xMax: 1900, yMin: 680, yMax: 1600 }
};

const INTRO_TIMEOUT = 19500;
const HEADPAT_CLAMP = 30;
const HEADPAT_DRAG_SCALE = 0.35;
const HEADPAT_FOLLOW_TIME = 0.055;
const HEADPAT_RETURN_TIME = 0.08;
const EYE_CLAMP_X = 200;
const EYE_CLAMP_Y = EYE_CLAMP_X * (9 / 16);
const EYE_STEP = 10;

let mousePos = { x: 0, y: 0 };
let volume = 0.5;
let mouseOptions = { voicelines: true, headpatting: true, mousetracking: true, drawHitboxes: false };

// Helper clamp function. Math does not appear to have clamp() in this version.
function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

// NOTE: X and Y appears to be inversely related from cursor position to bone adjustment.
//       This behavior's reason is unknown, but it LOOKS right so leave it alone!
function trackMouse() {
	let adjX = (mousePos.x / canvas.width) - 0.5;
	let adjY = (mousePos.y / canvas.height) - 0.5;
	TEye.y = TEye.y - (Math.sign(adjX) * EYE_STEP);
	TEye.x = TEye.x - (Math.sign(adjY) * EYE_STEP);
	TEye.y = clamp(TEye.y, EPointY - (Math.abs(adjX) * EYE_CLAMP_X), EPointY + (Math.abs(adjX) * EYE_CLAMP_X));
	TEye.x = clamp(TEye.x, EPointX - (Math.abs(adjY) * EYE_CLAMP_Y), EPointX + (Math.abs(adjY) * EYE_CLAMP_Y));
}

function untrackMouse() {
	if (Math.abs(TEye.y - EPointY) <= EYE_STEP && Math.abs(TEye.x - EPointX) <= EYE_STEP) {
		if (untrackerID != -1) {
			TEye.y = EPointY;
			TEye.x = EPointX;
			clearInterval(untrackerID);
			untrackerID = -1;
			setTimeout(function () {
				acceptingClick = true;
			}, 500);
		}
	}
	if (TEye.y > EPointY) TEye.y -= EYE_STEP;
	if (TEye.y < EPointY) TEye.y += EYE_STEP;
	if (TEye.x > EPointX) TEye.x -= EYE_STEP;
	if (TEye.x < EPointX) TEye.x += EYE_STEP;
}

function applyHeadpat(delta) {
	const dx = headpatTarget.x - headpatOffset.x;
	const dy = headpatTarget.y - headpatOffset.y;
	if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
		headpatOffset.set(headpatTarget.x, headpatTarget.y);
	} else {
		const blend = 1 - Math.exp(-delta / (headpatOrigin ? HEADPAT_FOLLOW_TIME : HEADPAT_RETURN_TIME));
		headpatOffset.x += dx * blend;
		headpatOffset.y += dy * blend;
	}
	TPoint.x += headpatOffset.x;
	TPoint.y += headpatOffset.y;
}

function releaseHeadpatOnExit() {
	if (headpatOrigin && spineData) releasedMouse();
}

function playVoiceline() {
	const state = spineData.state;
	const animationName = `Talk_0${currentVoiceline}`;
	const { dialog } = AUDIO_DETAIL[currentVoiceline - 1];
	const motion = state.setAnimation(1, `${animationName}_M`, false);
	const expression = state.setAnimation(2, `${animationName}_A`, false);
	state.addEmptyAnimation(1, 0.5, motion.animationEnd);
	state.addEmptyAnimation(2, 0.5, expression.animationEnd);

	const cues = motion.animation.timelines
		.flatMap(timeline => timeline.events || [])
		.filter(event => event.data.name === 'Talk');
	const clips = new Map(cues.map((event, index) => {
		const filename = CHARACTER + event.stringValue.slice(CHARACTER.length).toLowerCase();
		const track = new Audio(`./assets/audio/${filename}.ogg`);
		track.preload = 'auto';
		track.volume = volume;
		return [event, { track, dialog, index }];
	}));

	acceptingClick = false;
	motion.listener = {
		event: (_entry, event) => {
			const clip = clips.get(event);
			if (!clip) return;
			const { track, index } = clip;
			currentTracks.push(clip);
			const finish = () => {
				if (!currentTracks.includes(clip)) return;
				currentTracks = currentTracks.filter(active => active !== clip);
				if (!currentTracks.length) textbox.style.opacity = 0;
			};
			track.addEventListener('ended', finish, { once: true });
			track.play().catch(finish);

			if (dialogBox) {
				textbox.textContent = getSubtitleText(dialog, window.selectedLanguage, index);
				textbox.style.opacity = 1;
			}
		},
		complete: () => {
			acceptingClick = true;
			currentVoiceline = currentVoiceline % AUDIO_DETAIL.length + 1;
		}
	};
}

// Hitbox Scaling
function t(n, side) {
	let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } }
	n = d[side].mid - n;
	n = (d[side].length / (transpose * 2)) - n;
	n = (n - (d[side].length / (transpose * 2))) / customScale;
	return (n + (d[side].length / (transpose * 2))) * transpose;
}

// -1 = [No Entry], 1 = Headpat, 2 = Voiceline, 3 = Eye Track
function pressedMouse(x, y) {
	tx = t(x, 'x');
	ty = t(y, 'y');
	if (tx > HITBOX.headpat.xMin && tx < HITBOX.headpat.xMax && ty > HITBOX.headpat.yMin && ty < HITBOX.headpat.yMax && mouseOptions.headpatting) {
		spineData.state.setAnimation(1, 'Pat_01_M', false);
		if (HAS_A.point) spineData.state.setAnimation(2, 'Pat_01_A', false);
		headpatOrigin = { x, y };
		mouseSelect = 1;
	}
	else if (tx > HITBOX.voiceline.xMin && tx < HITBOX.voiceline.xMax && ty > HITBOX.voiceline.yMin && ty < HITBOX.voiceline.yMax && mouseOptions.voicelines) {
		mouseSelect = 2;
	}
	else if (mouseOptions.mousetracking) {
		if (trackerID == -1) {
			trackerID = setInterval(trackMouse, 20);
		}
		spineData.state.setEmptyAnimation(1, 0);
		spineData.state.setEmptyAnimation(2, 0);
		let eyetracking = spineData.state.addAnimation(1, 'Look_01_M', false, 0);
		eyetracking.mixDuration = 0.2;
		if (HAS_A.eye) {
			let eyetracking2 = spineData.state.addAnimation(2, 'Look_01_A', false, 0);
			eyetracking2.mixDuration = 0.2;
		}
		mousePos.x = x;
		mousePos.y = y;
		mouseSelect = 3;
	}
	else if (mouseSelect == -1) {
		acceptingClick = true;
	}
}

function drawHitboxes() {
	if (!overlay || !overlay.getContext) return;
	const ctx = overlay.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, overlay.width, overlay.height);
	if (!mouseOptions.drawHitboxes) return;

	
	ctx.save();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'red';
	ctx.globalAlpha = 0.5;

	function worldToScreen(n, side) {
		let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } };
		n = (n / transpose) - (d[side].length / (transpose * 2));
		n = n * customScale + (d[side].length / (transpose * 2));
		n = (d[side].length / (transpose * 2)) - n;
		const offset = side === 'x' ? canvas.width * positionX : canvas.height * positionY;
		return d[side].mid - n + offset;
	}

	for (const key in HITBOX) {
		const box = HITBOX[key];
		const x1 = worldToScreen(box.xMin, 'x');
		const y1 = worldToScreen(box.yMin, 'y');
		const x2 = worldToScreen(box.xMax, 'x');
		const y2 = worldToScreen(box.yMax, 'y');
		const width = x2 - x1;
		const height = y1 - y2;
		ctx.strokeRect(x1, y2, width, height);
	}

	ctx.restore();
}

function movedMouse(x, y) {
	switch (mouseSelect) {
		case 1: {
			const scale = HEADPAT_DRAG_SCALE * transpose / customScale;
			const parent = TPoint.parent;
			headpatTarget.set(
				parent.worldX + (x - headpatOrigin.x) * scale,
				parent.worldY + (headpatOrigin.y - y) * scale
			);
			parent.worldToLocal(headpatTarget);
			const distance = headpatTarget.length();
			if (distance > HEADPAT_CLAMP) {
				headpatTarget.x *= HEADPAT_CLAMP / distance;
				headpatTarget.y *= HEADPAT_CLAMP / distance;
			}
			break;
		}
		case 2:
			mouseSelect = -1;
			acceptingClick = true;
			break;
		case 3:
			mousePos.x = x;
			mousePos.y = y;
			break;
		default:
	}
}

function releasedMouse() {
	switch (mouseSelect) {
		case 1: {
			headpatOrigin = null;
			headpatTarget.set(0, 0);
			const state = spineData.state;
			const motion = state.setAnimation(1, 'PatEnd_01_M', false);
			const expression = state.setAnimation(2, 'PatEnd_01_A', false);
			state.addEmptyAnimation(1, 0.5, motion.animationEnd);
			state.addEmptyAnimation(2, 0.5, expression.animationEnd);
			headpatCooldown = setTimeout(() => {
				headpatCooldown = 0;
				acceptingClick = true;
			}, 500);
			break;
		}
		case 2:
			playVoiceline();
			break;
		case 3:
			if (trackerID != -1) {
				clearInterval(trackerID);
				trackerID = -1;
			}
			if (untrackerID == -1) {
				untrackerID = setInterval(untrackMouse, 20);
			}
			let eyetracking = spineData.state.setAnimation(1, 'LookEnd_01_M', false);
			let eyetracking2 = spineData.state.setAnimation(2, 'LookEnd_01_A', false);
			eyetracking.mixDuration = 0;
			eyetracking2.mixDuration = 0;
			spineData.state.addEmptyAnimation(1, 0.5, 0);
			spineData.state.addEmptyAnimation(2, 0.5, 0);
			break;
		default:
	}
	mouseSelect = -1;
}

// adjusts mouse values for flipped canvas
function setMouse(event) {
	let ax = event.clientX;
	let ay = event.clientY;
	if (flipped) {
		ax = canvas.width - ax;
	}

	return { x: ax - canvas.width * positionX, y: ay - canvas.height * positionY };
}

function getSubtitleText(dialog, language, index) {
	let text = dialog?.[language]?.[index];
	if (text == null && language === 'Thai') {
		language = 'English';
		text = dialog?.[language]?.[index];
	}
	textbox.lang = subtitleLocales[language];
	return text ?? "";
}

function updateSubtitleLanguage() {
	let language = subtitleLanguagePreference;
	if (language === 'auto') {
		const locale = interfaceLanguage === 'default' ? steamLanguage : interfaceLanguage;
		const [primary, region] = locale.split(/[-_]/);
		if (primary === 'tchinese' || (primary === 'zh' && ['cht', 'hant', 'tw', 'hk', 'mo'].includes(region))) {
			language = 'TraditionalChinese';
		} else if (primary === 'schinese' || primary === 'zh') {
			language = 'Chinese';
		} else if (primary === 'ja' || primary === 'japanese') {
			language = 'Japanese';
		} else if (primary === 'ko' || primary === 'korean' || primary === 'koreana') {
			language = 'Korean';
		} else if (primary === 'th' || primary === 'thai') {
			language = 'Thai';
		} else {
			language = 'English';
		}
	}

	if (language === window.selectedLanguage) return;
	window.selectedLanguage = language;
	textbox.lang = subtitleLocales[language];
	const clip = currentTracks.at(-1);
	if (dialogBox && clip) textbox.textContent = getSubtitleText(clip.dialog, language, clip.index);
}

function init() {
	// Wallpaper Engine settings
	window.wallpaperPropertyListener = {
		applyGeneralProperties: (props) => {
			const language = props.language?.value ?? props.language;
			const steamLocale = props.steamlanguage?.value ?? props.steamlanguage;
			if (typeof language !== 'string' && typeof steamLocale !== 'string') return;
			if (typeof language === 'string') interfaceLanguage = language.toLowerCase();
			if (typeof steamLocale === 'string') steamLanguage = steamLocale.toLowerCase();
			updateSubtitleLanguage();
		},
		applyUserProperties: (props) => {
			if (props.schemecolor) {
				bufferColor = props.schemecolor.value.split(" ");
			}
			if (props.alignmentfliph) flipped = props.alignmentfliph.value;
			if (props.scale) {
				customScale = props.scale.value;
				document.documentElement.style.setProperty('--wallpaper-scale', customScale);
			}
			if (props.positionx) {
				positionX = props.positionx.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-x', props.positionx.value + 'vw');
			}
			if (props.positiony) {
				positionY = props.positiony.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-y', props.positiony.value + 'vh');
			}
			if (props.scale || props.positionx || props.positiony) resize();
			if (props.targetfps) targetFps = props.targetfps.value;

			if (props.introanimation) introAnimation = props.introanimation.value;
			if (props.modelresolution) {
				const selected = props.modelresolution.value;
				if (['2k', '4k', '8k'].includes(selected)) modelResolution = selected;
			}
			requestModelResolution(Boolean(props.modelresolution));

			if (props.mousetracking) mouseOptions.mousetracking = props.mousetracking.value;
			if (props.headpatting) mouseOptions.headpatting = props.headpatting.value;
			if (props.voicelines) mouseOptions.voicelines = props.voicelines.value;
			if (props.voicevolume) volume = props.voicevolume.value / 100;
			if (props.showdialog) dialogBox = props.showdialog.value;
			if (props.dialogx) textbox.style.left = props.dialogx.value + '%';
			if (props.dialogy) textbox.style.top = props.dialogy.value + '%';
			if (props.drawHitboxes) mouseOptions.drawHitboxes = props.drawHitboxes.value;

			if (props.dialoglanguage) {
				const language = props.dialoglanguage.value;
				subtitleLanguagePreference = Object.hasOwn(subtitleLocales, language) ? language : 'auto';
				updateSubtitleLanguage();
			}

			if (props.bgmfile) {
				bgmfile = 'file:///' + props.bgmfile.value.replace("%3A", "\:");
			}
			if (props.bgmvolume) {
				bgmvolume = props.bgmvolume.value / 100;
				if (bgm) bgm.volume = bgmvolume;
			}
		},
		setPaused: function (isPaused) {
			if (bgm) {
				if (isPaused) {
					setTimeout(() => { bgm.volume = 0; }, 200);
				} else {
					setTimeout(() => { bgm.volume = bgmvolume; }, 200);
				}
			}
		}
	};

	textbox = document.getElementById('textbox');
	textbox.lang = subtitleLocales[window.selectedLanguage];

	canvas = document.getElementById('canvas');
	canvas.addEventListener('mouseleave', releaseHeadpatOnExit);
	window.addEventListener('blur', releaseHeadpatOnExit);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	overlay = document.getElementById('overlay');
	overlay.width = window.innerWidth;
	overlay.height = window.innerHeight;

	let config = { alpha: false, premultipliedAlpha: false };
	gl = canvas.getContext('webgl', config) || canvas.getContext('experimental-webgl', config);
	if (!gl) {
		alert('WebGL is unavailable.');
		return;
	}

	// Create a simple shader, mesh, model-view-projection matrix, SkeletonRenderer, and AssetManager.
	shader = spine.webgl.Shader.newTwoColoredTextured(gl);
	batcher = new spine.webgl.PolygonBatcher(gl);
	mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
	skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);
	assetManager = new spine.webgl.AssetManager(gl);


	initialLoadTimer = setTimeout(() => {
		if (typeof introAnimation === 'undefined') introAnimation = true;
		requestModelResolution();
	}, 350);
	window.addEventListener('resize', resize);
	window.addEventListener('pagehide', event => {
		if (event.persisted) return;
		canvas.style.visibility = 'hidden';
		clearTimeout(initialLoadTimer);
		cancelAnimationFrame(modelFrame);
		cancelAnimationFrame(renderFrame);
		clearTimeout(renderTimer);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	});
}

// CITATION: http://esotericsoftware.com/spine-api-reference#
// CITATION: http://en.esotericsoftware.com/forum/Spine-Unity-Making-the-arm-follow-the-mouse-7856
function interactionLoad() {
	// Touch_Point and Touch_Eye
	TPoint = spineData.skeleton.findBone('Touch_Point');
	TEye = spineData.skeleton.findBone('Touch_Eye');
	EPointX = TEye.x;
	EPointY = TEye.y;

	downaction = canvas.addEventListener('mousedown', function (event) {
		if (!acceptingClick) {
			return;
		}
		acceptingClick = false;
		let mouseData = setMouse(event);
		pressedMouse(mouseData.x, mouseData.y);
	});
	upaction = canvas.addEventListener('mouseup', function () {
		releasedMouse();
	});
	moveaction = canvas.addEventListener('mousemove', function (event) {
		let mouseData = setMouse(event);
		movedMouse(mouseData.x, mouseData.y);
	});

	if (!introAnimation) {
		acceptingClick = true;
	}
	else {
		setTimeout(function () {
			acceptingClick = true;
		}, INTRO_TIMEOUT);
	}

	return 1;
}

function requestModelResolution(force = false) {
	if (!assetManager || modelFrame || typeof introAnimation === 'undefined' || (!force && loadingResolution === modelResolution)) return;
	loadingResolution = modelResolution;
	const directory = loadingResolution === '8k' ? 'assets/' : 'assets/' + loadingResolution + '/';
	const models = [CHARACTER + '_home'];
	const binaryPaths = models.map(name => new URL(directory + name + '.skel', document.baseURI).href);
	const atlasPaths = models.map(name => new URL(directory + name + '.atlas', document.baseURI).href);

	canvas.style.visibility = 'hidden';
	cancelAnimationFrame(renderFrame);
	clearTimeout(renderTimer);
	assetManager.removeAll();
	if (!spineData) binaryPaths.forEach(file => assetManager.loadBinary(file));
	atlasPaths.forEach(file => assetManager.loadTextureAtlas(file));

	function waitForTextures() {
		if (!assetManager.isLoadingComplete()) {
			modelFrame = requestAnimationFrame(waitForTextures);
			return;
		}
		modelFrame = 0;
		if (loadingResolution !== modelResolution) {
			requestModelResolution();
			return;
		}
		const atlases = atlasPaths.map(file => assetManager.get(file));
		if (atlases.some(atlas => !atlas) || (!spineData && binaryPaths.some(file => !assetManager.get(file)))) {
			console.error('Spine model assets are unavailable for resolution: ' + loadingResolution);
			loadingResolution = undefined;
			return;
		}
		if (!spineData) {
			modelAtlases = atlases;
			load(binaryPaths, atlasPaths);
			return;
		}

		// Both resolutions use the same atlas layout and skeleton. Retain the active animation.
		modelAtlases.forEach((atlas, i) => {
			atlas.pages.forEach((page, j) => {
				page.texture = atlases[i].pages[j].texture;
			});
			for (const region of atlas.regions) region.texture = region.page.texture;
		});
		lastFrameTime = Date.now() / 1000;
		render();
		canvas.style.visibility = 'visible';
	}
	modelFrame = requestAnimationFrame(waitForTextures);
}

function load(binaryPaths, atlasPaths) {
	spineData = loadSpineData(binaryPaths[0], atlasPaths[0], false);

	// User Option to skip Intro Animation
	if (introAnimation) {
		spineData.state.addAnimation(0, 'Start_Idle_01', false);

		if (mouseOptions.voicelines) {
			let track = new Audio(`./assets/audio/${CHARACTER}_memoriallobby_0.ogg`);
			track.volume = volume;
			setTimeout(function () {
				track.play();
			}, 11500);
		}
	}

	spineData.state.addAnimation(0, 'Idle_01', true, 0);

	interactionLoad();
	resize();

	// Plays user-defined BGM (if set)
	bgm = new Audio(bgmfile);
	bgm.volume = bgmvolume;
	bgm.loop = true;
	bgm.play();
	bgm.addEventListener('ended', function () {
		this.currentTime = 0;
		this.play();
	}, false);

	lastFrameTime = Date.now() / 1000;
	// Call render every frame.
	render();
	canvas.style.visibility = 'visible';
}

function loadSpineData(binaryPath, atlasPath, premultipliedAlpha) {
	// Load the texture atlas from the AssetManager.
	let atlas = assetManager.get(atlasPath);

	// Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
	let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

	// Create a SkeletonBinary instance for parsing the .skel file.
	let skeletonBinary = new spine.SkeletonBinary(atlasLoader);

	// Set the scale to apply during parsing, parse the file, and create a new skeleton.
	skeletonBinary.scale = 1;
	let skeletonData = skeletonBinary.readSkeletonData(assetManager.get(binaryPath));
	let skeleton = new spine.Skeleton(skeletonData);
	let bounds = calculateSetupPoseBounds(skeleton);

	// Create an AnimationState, and set the initial animation in looping mode.
	let animationStateData = new spine.AnimationStateData(skeleton.data);
	animationStateData.defaultMix = 0.5;
	let animationState = new spine.AnimationState(animationStateData);

	// Pack everything up and return to caller.
	return { skeleton: skeleton, state: animationState, bounds: bounds, premultipliedAlpha: premultipliedAlpha };
}

function calculateSetupPoseBounds(skeleton) {
	skeleton.setToSetupPose();
	skeleton.updateWorldTransform();
	let offset = new spine.Vector2();
	let size = new spine.Vector2();
	skeleton.getBounds(offset, size, []);
	return { offset: offset, size: size };
}

function render() {
	let now = Date.now() / 1000;
	let delta = now - lastFrameTime;

	lastFrameTime = now;

	gl.clearColor(bufferColor[0], bufferColor[1], bufferColor[2], 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Apply the animation state based on the delta time.
	let skeleton = spineData.skeleton;
	let state = spineData.state;
	let premultipliedAlpha = spineData.premultipliedAlpha;
	state.update(delta);
	state.apply(skeleton);
	const pointX = TPoint.x;
	const pointY = TPoint.y;
	applyHeadpat(delta);
	skeleton.updateWorldTransform();
	TPoint.x = pointX;
	TPoint.y = pointY;

	// Bind the shader and set the texture and model-view-projection matrix.
	shader.bind();
	shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
	shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);

	// Start the batch and tell the SkeletonRenderer to render the active skeleton.
	batcher.begin(shader);
	skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
	skeletonRenderer.draw(batcher, skeleton);
	batcher.end();

	shader.unbind();

	// throttle fps
	let elapsed = Date.now() / 1000 - now;
	let targetFrameTime = 1 / targetFps;
	let delay = Math.max(targetFrameTime - elapsed, 0) * 1000;

	drawHitboxes();

	renderTimer = setTimeout(() => {
		renderFrame = requestAnimationFrame(render);
	}, delay);
}

function resize() {
	let w = canvas.clientWidth;
	let h = canvas.clientHeight;
	if (w === 0 || h === 0) return;
	if (canvas.width != w || canvas.height != h) {
		canvas.width = w;
		canvas.height = h;
		overlay.width = w;
		overlay.height = h;
	}

	// Set values to position skeleton to center of canvas.
	// Will always attempt to Fit to Fill while maintaining aspect ratio. As a result, a scale of [1] will mean different things across various device resolutions.
	let centerX = 0;
	let centerY = 900;
	let wr = canvas.width / 2560;
	let hr = canvas.height / 1600;
	let width = (2560 / customScale);
	let height = (1600 / customScale);

	if (wr < hr) {
		width = height * (canvas.width / canvas.height);

		transpose = 1600 / canvas.height;
	}
	else if (wr > hr) {
		height = width * (canvas.height / canvas.width);

		transpose = 2560 / canvas.width;
	}
	else {
		transpose = 1600 / canvas.height;
	}

	mvp.ortho2d(centerX - width / 2 - positionX * width, centerY - height / 2 + positionY * height, width, height);
	gl.viewport(0, 0, canvas.width, canvas.height);
}

init();
