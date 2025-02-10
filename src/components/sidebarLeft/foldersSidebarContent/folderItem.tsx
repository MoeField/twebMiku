import {onMount, Show} from 'solid-js';
import {IconTsx} from '../../iconTsx';
import {FolderItemPayload} from './types';
import ripple from '../../ripple';
import Badge from '../../badge';

type FolderItemProps = FolderItemPayload & {
  ref?: (el: HTMLDivElement | null) => void,
  class?: string,
  selected?: boolean,
  onClick?: () => void
};

export default function FolderItem(props: FolderItemProps) {
  let container: HTMLDivElement;

  onMount(() => {
    ripple(container);
  });

  const hasNotifications = () => !!props.notifications?.count;
  return (
    <div
      ref={(el) => {
        container = el;
        props.ref?.(el);
      }}
      class="folders-sidebar__folder-item"
      classList={{
        [props.class]: !!props.class,
        'folders-sidebar__folder-item--selected': props.selected
      }}
      {...(props.id !== undefined ?
        {'data-filter-id': props.id} :
        {}
      )}
      onClick={props.onClick}
    >
      <IconTsx icon={props.icon} class="folders-sidebar__folder-item-icon" />
      <Show when={props.name}>
        <div class="folders-sidebar__folder-item-name">{props.name}</div>
      </Show>
      <Show when={hasNotifications()}>
        <Badge
          class="folders-sidebar__folder-item-badge"
          tag="div"
          color={props.notifications.muted && !props.selected ? 'gray' : 'primary'}
          size={18}
        >
          {'' + props.notifications.count}
        </Badge>
      </Show>
    </div>
  );
}

// const invertedCornerSvg = (cls: string) => (
//   <svg class={cls} width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M0 0V8H8C3 8 0 5 0 0Z" fill="#212121"/>
//   </svg>
// );
