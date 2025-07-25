import { contrastColor } from 'contrast-color';
import { getStatus } from './shared/index.js';

export const graphicConverter = {
  toFirestore(data) {
    return data;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);

    return {
      photos: data.photos,
      key: snapshot.id,
      geometry: {
        type: 'point',
        x: data.location.x,
        y: data.location.y,
        spatialReference: {
          wkid: 3857,
        },
      },
      symbol: {
        type: 'simple-marker',
        style: 'circle',
        color: data.color,
        size: '8px',
        outline: {
          color: contrastColor.call({}, { bgColor: data.color }),
          width: 1,
        },
      },
      attributes: {
        name: data.name,
        notes: data.notes,
        when: data.created_at.toDate().toISOString(),
        id: snapshot.id,
      },
    };
  },
};

const colors = {
  Unknown: '#94a3b8',
  'Pending UGRC review': '#581c87',
  'Pending county review': '#86198f',
  'The county rejected the submission.': '#f43f5e',
  'UGRC rejected submission.': '#f43f5e',
  'Pending PLSS geometry corrections': '#10b981',
  'Sheet and geometry corrections are live': '#f0fdfa',
};

export const myContentConverter = {
  toFirestore(data) {
    return data;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);

    const status = getStatus(data.status);

    if (status.label in colors) {
      data.color = colors[status.label];
    } else {
      for (const [title, color] of Object.entries(colors)) {
        if (status.label === title || status.label.includes(title)) {
          data.color = color;
        }
      }
    }

    if (!data.color) {
      data.color = colors.Unknown;
    }

    const result = {
      id: data.blm_point_id,
      key: snapshot.id,
      submitted: data.created_at.toDate().toISOString(),
      label: status.label,
      status,
      symbol: {
        type: 'simple-marker',
        style: 'circle',
        color: data.color,
        size: '8px',
        outline: {
          color: contrastColor.call({}, { bgColor: data.color }),
          width: 1,
        },
      },
      attributes: {
        id: data.blm_point_id,
        status: status.label,
        when: data.created_at.toDate().toISOString(),
        ref: data.monument,
      },
    };

    if (data.location) {
      result.geometry = {
        type: 'point',
        x: data.location.longitude,
        y: data.location.latitude,
        spatialReference: {
          wkid: 4326,
        },
      };
    }

    return result;
  },
};
