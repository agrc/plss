import { contrastColor } from 'contrast-color';

export const graphicConverter = {
  toFirestore(data) {
    return data;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);

    return {
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
