import VideoItem from "@/component/VideoItem";
import { getRecommendVideoList, recommendVideoList } from "@/service/video";
import { NGrid, NGridItem, NH2, NSpin, NText } from "naive-ui";
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  props: {},
  emits: [],
  setup: (props, ctx) => {
    const loading = ref(false);

    function fetchData() {
      loading.value = true;
      getRecommendVideoList().finally(() => {
        loading.value = false;
      });
    }

    onMounted(() => {
      fetchData();
    });

    return () => (
      <>
        <NH2 prefix="bar">
          <NText>最新推荐</NText>
        </NH2>
        <NSpin show={loading.value}>
          <div class="video-list">
            <NGrid cols="2 s:3 m:4 l:5 xl:6" xGap={10} yGap={10} responsive="screen">
              {recommendVideoList.value.map(item => {
                return (
                  <NGridItem>
                    <VideoItem video={item}></VideoItem>
                  </NGridItem>
                );
              })}
            </NGrid>
          </div>
        </NSpin>
      </>
    );
  },
});
