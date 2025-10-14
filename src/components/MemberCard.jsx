import { useTranslation } from 'react-i18next';

export const MemberCard = (member) => {
    const { t } = useTranslation();
    const { name } = member.name;
    const { role } = member.role;
    const { charge } = member.charge;
    const { image } = member.image;
    return (
        <div></div>
    );
}