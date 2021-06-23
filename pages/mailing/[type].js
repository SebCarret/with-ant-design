import styles from '../../styles/email-finder.module.css';
import TopMenu from '../../components/TopMenu';
import { useRouter } from 'next/router';
import SendSingleEmail from '../../components/SendSingleEmail';
import SendEmailFromList from '../../components/SendEmailFromList';
import SendEmailFromFile from '../../components/SendemailFromFile';

export default function mailingContainer() {

    const router = useRouter();
    const { type } = router.query;

    let title;
    let description;
    let contentToDisplay;

    switch (type){
        case 'single':
            title = 'Send single email';
            description = 'Please fill in all fields below to respect dynamic variables set in your EmailJS template.';
            contentToDisplay = <SendSingleEmail />
        break;
        case 'upload':
            title = 'Send emails from a CSV file';
            description = 'Select contacts from an uploaded list to send them emails based on your EmailJS templates.';
            contentToDisplay = <SendEmailFromFile />
        break;
        case 'list':
            title = 'Send emails from your lists';
            description = 'Select contacts from one of your list to send them emails based on your EmailJS templates.';
            contentToDisplay = <SendEmailFromList />
        break;
    }

    return (
        <div id={styles.container}>
            <TopMenu />
            <div id={styles.topContent}>
                <div id={styles.titleContainer}>
                    <h2 id={styles.title}>{title}</h2>
                    {/* <Badge count={verificationCredits}>
                        <Tooltip title={`Credits availables until ${credits.date}`}>
                            <CheckCircleOutlined id={styles.verifPicto} />
                        </Tooltip>
                    </Badge> */}
                </div>
                <p>{description}</p>
            </div>
            {contentToDisplay}
        </div>
    )
}