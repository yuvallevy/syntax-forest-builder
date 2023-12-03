import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const useAutoHtmlDirection = () => {
  const { i18n } = useTranslation();

  const direction = i18n.dir();
  useEffect(() => {
    const htmlElement = document.querySelector('html') as HTMLElement;
    htmlElement.lang = i18n.language;
    htmlElement.dir = direction;
  }, [i18n.language, direction]);
}

export default useAutoHtmlDirection;
