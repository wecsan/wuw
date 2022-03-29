import PlayList from "@/component/PlayList";
import RecommendList from "@/component/RecommendList";
import config from "@/config";
import { appConfig, menuCollapsed } from "@/service/common";
import { changeThemeType, themeType, ThemeTypes } from "@/service/common";
import { postPlayLog } from "@/service/history";
import { getRecommendByCategoryId, getVideoDetail, videoDetail } from "@/service/video";
import { computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref } from "vue";
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import Player, { IPlayerOptions } from "xgplayer";
import HlsJsPlayer from "xgplayer-hls.js";

export default defineComponent({
  props: {
    videoId: {
      type: Number as PropType<number>,
      default: null,
    },
    playId: {
      type: Number as PropType<number>,
      default: null,
    },
  },
  emits: [],
  setup: (props, ctx) => {
    let videoPlayer: Player;
    const el = ref<HTMLElement | undefined>();
    const router = useRouter();
    const playId = ref(props.playId);
    const play = computed(() => {
      if (!videoDetail.value) {
        return null;
      }
      return videoDetail.value.playlist.find(v => v.id === Number(playId.value));
    });

    const oldTheme = themeType.value;
    const oldCollapsed = menuCollapsed.value;

    // const playNextUrls = computed(() => {
    //   if (!videoDetail.value || !play.value?.id) {
    //     return [];
    //   }
    //   const playlist = Array.from(videoDetail.value.playlist);
    //   const index = playlist.findIndex(v => v.id === Number(play.value?.id));
    //   return playlist.slice(index).map(v => v.src);
    // });

    function createPlayer() {
      if (!videoDetail.value) {
        return null;
      }
      if (!play.value) {
        return;
      }
      if (!el.value) {
        return;
      }
      videoPlayer?.destroy();
      const { offsetWidth, offsetHeight } = el.value;
      setTimeout(() => {
        const options: IPlayerOptions = {
          el: el.value,
          autoplay: appConfig.value.autoplay,
          url: play.value?.src || "",
          width: offsetWidth,
          height: offsetHeight,
          fitVideoSize: appConfig.value.fitVideoSize,
          // fluid: true,
          poster: videoDetail.value?.cover,
          playbackRate: config.playbackRates,
          defaultPlaybackRate: appConfig.value.playbackRate,
          pip: appConfig.value.pip,
          miniplayer: appConfig.value.miniplayer,
          enableContextmenu: true,
          lang: "zh-cn",
          volume: appConfig.value.volume / 100,
          // playNext: {
          //   urlList: playNextUrls.value,
          // },
          // download: true
        };
        if (String(options.url).indexOf(".m3u8") !== -1) {
          videoPlayer = new HlsJsPlayer(options);
        } else {
          videoPlayer = new Player(options);
        }

        // 视频加载完成做处理
        videoPlayer.once("complete", () => {
          if (videoDetail.value && play.value) {
            // 播放历史
            postPlayLog(videoDetail.value.id, play.value.id);
          }
        });
        videoPlayer.on("ended", e => {
          // 自动进入下一集
          if (appConfig.value.autoNext && videoDetail.value && play.value?.circuit_id) {
            const playlist = Array.from(videoDetail.value.playlist).filter(v => v.circuit_id === Number(play.value?.circuit_id));
            const index = playlist.findIndex(v => v.id === Number(play.value?.id));
            if (index < 0 || index >= playlist.length - 1) {
              return;
            }
            const { id: playId } = playlist[index + 1];
            router.replace({ name: "play", params: { videoId: props.videoId, playId } });
          }
        });
      }, 100);
    }

    function fetchData() {
      getVideoDetail(props.videoId).then(data => {
        createPlayer();
        // 推荐
        getRecommendByCategoryId(data.category_id);
      });
    }

    onBeforeRouteUpdate(to => {
      playId.value = Number(to.params.playId);
      createPlayer();
    });

    onMounted(() => {
      createPlayer();
      fetchData();

      changeThemeType(ThemeTypes.DARK);
      menuCollapsed.value = true;
    });

    onBeforeUnmount(() => {
      videoPlayer?.destroy();
      changeThemeType(oldTheme);
      menuCollapsed.value = oldCollapsed;
    });

    return () => (
      <>
        <div class="video-player-container mar-b-5-item d-flex justify-center align-items-center">
          <div ref={el} class="video-player" />
        </div>
        <div class="d-flex align-items-center mar-b-5">
          <h1 class="font-xlg mar-r-2-item">{videoDetail.value?.title}</h1>
          <span class="font-large font-bold mar-r-2-item font-gray">·</span>
          <span>{play.value?.title}</span>
        </div>
        <PlayList
          playId={play.value?.id}
          playlist={videoDetail.value?.playlist}
          onClick={({ id: playId }) => {
            router.replace({ name: "play", params: { videoId: props.videoId, playId } });
          }}
        />
        <RecommendList />
      </>
    );
  },
});
