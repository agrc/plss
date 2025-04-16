import { ArrowDownOnSquareIcon } from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';
import { useFirebaseStorage } from '@ugrc/utah-design-system';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import PropTypes from 'prop-types';
import Card from '../formElements/Card.jsx';

const TieSheetList = ({ blmPointId, children }) => {
  const { storage } = useFirebaseStorage();

  const path = `tiesheets/${blmPointId}`;
  const fileRef = ref(storage, path);

  const { data, status } = useQuery({
    enabled: blmPointId != null,
    queryKey: ['identify', blmPointId, fileRef],
    queryFn: async () => {
      const response = await listAll(fileRef);

      if ((response?.items?.length ?? 0) > 0) {
        const urls = await Promise.all(
          response.items.map(async (item) => {
            const url = await getDownloadURL(item);

            return {
              url,
              name: item.name,
            };
          }),
        );

        return urls;
      }

      return [];
    },
    staleTime: Infinity,
  });

  return (
    <Card>
      <div>
        <h4 className="text-xl font-medium">Monument Records</h4>
        {status === 'pending' && <div>Loading...</div>}
        {status === 'error' && <div>The monument records are currently not available</div>}
        {status === 'success' && (data?.length ?? 0) === 0 && <div>This point has no monument records</div>}
        {status === 'success' && data.length > 0 && (
          <ul>
            {data.map((x) => (
              <li key={x.name} className="group hover:rounded-sm hover:bg-slate-100">
                <span className="inline-flex align-middle">
                  <ArrowDownOnSquareIcon className="mr-2 inline-block h-4 w-4 text-sky-600 group-hover:text-sky-800" />
                  <a href={x.url} target="_blank" rel="noopener noreferrer">
                    {x.name}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
};
TieSheetList.propTypes = {
  blmPointId: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default TieSheetList;
