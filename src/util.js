import styles from './tile-row.module.sass';
import tileStyles from './tile.module.sass';
import episodeStyles from './episode.module.sass';
import { data } from './data.js';

export const flattenData = (node) => {
  const title = node.title || node.show?.title;
  const subtitle = node.subtitle || "";
  const imageBanner = node.show.imageBanner.url || "";
  const imageIconic = node.episode?.imageIconic?.url || node.show?.imageIconic?.url;
  const description = node.description || "";
  const longDescription = node.longDescription || "";
  const duration = node.durationInSeconds;
  const channelLogo = node.channel?.images?.largeWhite;
  const schedule = node.airingTime || node.availabilityStartsAt;
  return {
    title,
    subtitle,
    imageBanner,
    imageIconic,
    description,
    longDescription,
    duration,
    channelLogo,
    schedule
  };
};

export const dateFormat = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const EpisodeRowStatic = () => {
  const episodeRowStyle = `${styles.episodeRow}`;
  const episodeRowTiles = data[0].edges.map(tile => {
    const { node, cursor } = tile;
    const {
      title,
      subtitle,
      imageIconic,
      duration,
      channelLogo,
      schedule
    } = flattenData(node);
    const subTitle = node.episode ? <span className={tileStyles.subtitle}>{subtitle}</span> : null;
    const tileStyle = `${episodeStyles.tile}`;
    return (
      <li className={tileStyle} key={cursor}>
        <img className={episodeStyles.image} alt="" src={imageIconic} />
        <img className={episodeStyles.imageIconic} alt="" src={imageIconic} />
        <div className={episodeStyles.container}>
          <div className={episodeStyles.header}><img className={episodeStyles.logo} alt="" src={channelLogo} /></div>
          <div className={episodeStyles.body}>
            <span className={episodeStyles.title}>{title}</span>
            {subTitle}
            <span className={episodeStyles.duration}>{duration}</span>
            <span className={episodeStyles.schedule}>{dateFormat(schedule)}</span>
          </div>       
        </div>
      </li>
    );
  });
  const episodeRow = <ul className={episodeRowStyle} key="99">{episodeRowTiles}</ul>;
  return episodeRow;
}

export const ShowRowStatic = () => {
  const episodeRowStyle = `${styles.row} ${styles.showRow}`;
  const tileStyle = `${episodeStyles.tile} ${episodeStyles.show}`;
  const episodeRowTiles = data[2].edges.map(tile => {
    const { node, cursor } = tile;
    const {
      title,
      subtitle,
      imageBanner,
      duration,
      channelLogo,
      schedule
    } = flattenData(node);
    const subTitle = node.episode ? <span className={tileStyles.subtitle}>{subtitle}</span> : null;
    return (
      <li className={tileStyle} key={cursor}>
        <img className={episodeStyles.image} alt="" src={imageBanner} />
        <div className={episodeStyles.container}>
          <div className={episodeStyles.header}><img className={episodeStyles.logo} alt="" src={channelLogo} /></div>
          <div className={episodeStyles.body}>
            <span className={episodeStyles.title}>{title}</span>
            {subTitle}
            <span className={episodeStyles.duration}>{duration}</span>
            <span className={episodeStyles.schedule}>{dateFormat(schedule)}</span>
          </div>       
        </div>
      </li>
    );
  });
  const showRow = <ul className={episodeRowStyle} key="98">{episodeRowTiles}</ul>;
  return showRow;
}
