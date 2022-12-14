import config from "@/config";
import { PageData } from "@/config/type";
import { DialogApiInjection } from "naive-ui/lib/dialog/src/DialogProvider";
import { NotificationApiInjection } from "naive-ui/lib/notification/src/NotificationProvider";
import { computed, ref } from "vue";
import { darkTheme, GlobalTheme, GlobalThemeOverrides, useOsTheme } from "naive-ui";
import { IPlayerOptions } from "xgplayer";
import { localStorage } from "@/helper/storage";
// import pwaInstallHandler from "pwa-install-handler";
import router from "@/router";
import { MessageApiInjection } from "naive-ui/lib/message/src/MessageProvider";
import { appWindow } from "@tauri-apps/api/window";
// import { plusSetStatusBar } from "./plus";

const os = useOsTheme();

export let notification: NotificationApiInjection;
export function setNotification(e: NotificationApiInjection) {
  notification = e;
}
export let dialog: DialogApiInjection;
export function setDialog(e: DialogApiInjection) {
  dialog = e;
}

export let message: MessageApiInjection;
export function setMessage(e: MessageApiInjection) {
  message = e;
}

// 返回顶部按钮
export const isShowBackTop = ref(false);

// 设置
export const settingOpen = ref(false);

// 视频播放倍速列表
export const playbackRates = ref(config.playbackRates);

// history页数
export const visitedPageNum = ref(0);

export const windowWidth = ref(window.innerWidth);
export const isMobileWidth = computed(() => {
  return windowWidth.value < config.breakpoints.s;
});

// 默认的分页数据
export const defaultPageData: PageData = {
  count: 0,
  pageCount: 1,
  page: 1,
  pageSize: 20,
  data: [],
};

export const enum ThemeTypes {
  OS = "os",
  LIGHT = "light",
  DARK = "dark",
}
export const themeTypes = [
  {
    label: "跟随系统",
    key: ThemeTypes.OS,
  },
  {
    label: "亮色",
    key: ThemeTypes.LIGHT,
  },
  {
    label: "暗色",
    key: ThemeTypes.DARK,
  },
];

export const enum ThemeColors {
  RED = "red",
  GREEN = "green",
  BLUE = "blue",
  YELLOW = "yellow",
  PURPLE = "purple",
}
export const themeColors = [
  {
    label: "红色",
    key: ThemeColors.RED,
    color: "#f5222d",
    hoverColor: "#ff3b45",
    pressedColor: "#e01a24",
  },
  {
    label: "绿色",
    key: ThemeColors.GREEN,
    color: "#18a058",
    hoverColor: "#24b86a",
    pressedColor: "#1a7f4a",
  },
  {
    label: "蓝色",
    key: ThemeColors.BLUE,
    color: "#2f54eb",
    hoverColor: "#4e6ef2",
    pressedColor: "#2e49ba",
  },
  {
    label: "黄色",
    key: ThemeColors.YELLOW,
    color: "#dcbf00",
    hoverColor: "#dbc433",
    pressedColor: "#c1aa14",
  },
  {
    label: "紫色",
    key: ThemeColors.PURPLE,
    color: "#722ed1",
    hoverColor: "#934af8",
    pressedColor: "#5a1fab",
  },
];

export const themeOverrides = computed<GlobalThemeOverrides>(() => {
  const themeColor = themeColors.find(v => v.key === appConfig.value.themeColor);
  const common: GlobalThemeOverrides["common"] = { fontSize: "16px" };
  if (themeColor) {
    common.primaryColor = themeColor.color;
    common.primaryColorHover = themeColor.hoverColor;
    common.primaryColorPressed = themeColor.pressedColor;
    common.primaryColorSuppl = themeColor.pressedColor;
  }

  return { common };
});

// 视频数量
export const videoLength = computed(() => {
  let length = 2 * 20;
  if (windowWidth.value >= config.breakpoints.xl) {
    length = 6 * 6;
  } else if (windowWidth.value >= config.breakpoints.l) {
    length = 5 * 8;
  } else if (windowWidth.value >= config.breakpoints.m) {
    length = 4 * 10;
  } else if (windowWidth.value >= config.breakpoints.s) {
    length = 3 * 13;
  }
  return length;
});

// 个性化配置
export interface IConfig {
  // 主题
  themeType: ThemeTypes;
  themeColor: ThemeColors;

  // 视频
  // 音量
  volume: number;
  // 自动播放
  autoplay: boolean;
  // 播放速度
  playbackRate: number;
  // 视频布局
  fitVideoSize: IPlayerOptions["fitVideoSize"];
  // 画中画
  pip: boolean;
  // 小窗口
  miniplayer: boolean;
  // 全屏播放
  fullscreenPlay: boolean;

  // 自动播放下一集
  autoNext: boolean;

  // 推荐
  recommend: boolean;

  // 搜索历史
  searchLog: boolean;
  // 观看历史
  playLog: boolean;
}
export const fitVideoSizes = [
  {
    text: "自动",
    value: "auto",
  },
  {
    text: "高度自适应",
    value: "fixWidth",
  },
  {
    text: "宽度自适应",
    value: "fixHeight",
  },
];
export const defaultConfig: IConfig = {
  themeType: ThemeTypes.OS,
  themeColor: ThemeColors.GREEN,
  volume: 60,
  autoplay: true,
  pip: true,
  miniplayer: true,
  recommend: true,
  playbackRate: 1.0,
  fitVideoSize: "fixHeight",
  searchLog: true,
  playLog: true,
  autoNext: true,
  fullscreenPlay: true,
};
let localConfig = localStorage.get<IConfig>("appConfig") || defaultConfig;
if (typeof localConfig === "string" || Array.isArray(localConfig)) {
  localConfig = defaultConfig;
}
export const appConfig = ref<IConfig>(defaultConfig);
export function setAppConfig(params: Partial<IConfig>) {
  if (params.themeType !== undefined) {
    const value = params.themeType;
    if (themeTypes.some(v => v.key === value)) {
      appConfig.value.themeType = value;
    }
  }
  if (params.themeColor !== undefined) {
    const value = params.themeColor;
    if (themeColors.some(v => v.key === value)) {
      appConfig.value.themeColor = value;
    }
  }
  if (params.volume !== undefined) {
    const value = Number(params.volume);
    if (value > 0 && value <= 100) {
      appConfig.value.volume = value;
    }
  }
  if (params.playbackRate !== undefined) {
    const value = Number(params.playbackRate);
    if (playbackRates.value.includes(value)) {
      appConfig.value.playbackRate = value;
    }
  }
  if (params.fitVideoSize !== undefined) {
    const value = params.fitVideoSize;
    if (fitVideoSizes.some(v => v.value === value)) {
      appConfig.value.fitVideoSize = value;
    }
  }
  if (params.autoplay !== undefined) {
    appConfig.value.autoplay = Boolean(params.autoplay);
  }
  if (params.pip !== undefined) {
    appConfig.value.pip = Boolean(params.pip);
  }
  if (params.miniplayer !== undefined) {
    appConfig.value.miniplayer = Boolean(params.miniplayer);
  }
  if (params.fullscreenPlay !== undefined) {
    appConfig.value.fullscreenPlay = Boolean(params.fullscreenPlay);
  }
  if (params.recommend !== undefined) {
    appConfig.value.recommend = Boolean(params.recommend);
  }
  if (params.searchLog !== undefined) {
    appConfig.value.searchLog = Boolean(params.searchLog);
  }
  if (params.playLog !== undefined) {
    appConfig.value.playLog = Boolean(params.playLog);
  }
  if (params.autoNext !== undefined) {
    appConfig.value.autoNext = Boolean(params.autoNext);
  }
  localStorage.set("appConfig", appConfig.value);
}
setAppConfig(localConfig);
// 移动端默认视频宽度适配
if (isMobileWidth.value) {
  if (appConfig.value.fitVideoSize !== "fixWidth") {
    setAppConfig({
      fitVideoSize: "fixWidth",
    });
  }
  if (appConfig.value.miniplayer) {
    setAppConfig({
      miniplayer: false,
    });
  }
  if (appConfig.value.pip) {
    setAppConfig({
      pip: false,
    });
  }
}

// 菜单
export const menuCollapsed = ref(isMobileWidth.value);
window.addEventListener("resize", () => {
  windowWidth.value = window.innerWidth;
  menuCollapsed.value = isMobileWidth.value || router.currentRoute.value.name === "play";
});

// export const themeType = ref<ThemeTypes>(appConfig.value.themeType);
// export function changeThemeType(type: ThemeTypes) {
//   themeType.value = type;
// }
export const globalTheme = computed<GlobalTheme | null>(() => {
  if (appConfig.value.themeType === ThemeTypes.DARK || (appConfig.value.themeType === ThemeTypes.OS && os.value === "dark")) {
    return darkTheme;
  }
  return null;
});

// 应用下载
// export const canInstall = ref<boolean>(false);
// pwaInstallHandler.addListener(can => {
//   canInstall.value = Boolean(can);
// });

// 是不是全屏
export const isFullscreen = ref(false);
export function setFullscreen(v: boolean) {
  return appWindow.setFullscreen(v).then(() => {
    isFullscreen.value = v;
  });
}

// 设置标题
export function setTitle(title?: string) {
  const str = config.title + (title ? ` - ${title}` : "");
  if (config.isMsi) {
    appWindow.setTitle(str);
  }
  document.title = str;
}
