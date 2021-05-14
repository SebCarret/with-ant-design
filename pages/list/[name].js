import { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Dropdown, Menu } from 'antd';
import { DeleteOutlined, EditOutlined, LinkedinOutlined, UnorderedListOutlined, UserAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DbConnect from '../../models/dbConnect';
import leadsModel from '../../models/leads';
import CreateModal from '../../components/CreateModal';
import EditModal from '../../components/EditModal';

const List = ({ list }) => {

    const router = useRouter();
    const { name } = router.query;

    const [columns, setColumns] = useState([]);
    const [datas, setDatas] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isCreateVisible, setIsCreateVisible] = useState(false);
    const [isEditVisible, setIsEditVisible] = useState(false);
    const [contactToEdit, setContactToEdit] = useState({});

    useEffect(() => {
        for (let i = 0; i < list.length; i++) {
            list[i].key = i
        };
        const header = ["firstname", "lastname", "company", "domain", "email", "status", "linkedinUrl"]
        let finalHeaders = [];
        for (let title of header) {
            if (title !== '_id' && title !== 'list' && title !== '__v' && title !== 'key') {
                let columnTitle;
                switch (title) {
                    case 'firstname':
                        columnTitle = "Prénom"
                        break;
                    case 'lastname':
                        columnTitle = "Nom"
                        break;
                    case 'company':
                        columnTitle = "Société"
                        break;
                    case 'domain':
                        columnTitle = "Site web"
                        break;
                    case 'email':
                        columnTitle = "Email"
                        break;
                    case 'status':
                        columnTitle = "Statut"
                        break;
                    case 'linkedinUrl':
                        columnTitle = "Profil Linkedin"
                        break;
                    default:
                        console.log('yop');
                }
                if (columnTitle === "Statut") {
                    finalHeaders.push({
                        title: columnTitle,
                        dataIndex: title,
                        key: title,
                        render: status => {
                            let color;
                            let emailStatus;
                            switch (status) {
                                case 'validated':
                                    color = 'green';
                                    emailStatus = 'validé'
                                    break;
                                case 'not valid':
                                    color = 'red';
                                    emailStatus = 'invalide'
                                    break;
                                case 'unknown':
                                    color = 'orange';
                                    emailStatus = 'non vérifié'
                                    break;
                                default:
                                    emailStatus = 'pas d\'email'
                            }
                            return (<Tag color={color}>{emailStatus}</Tag>)
                        }
                    })
                } else if (columnTitle === "Profil Linkedin") {
                    finalHeaders.push({
                        title: columnTitle,
                        dataIndex: title,
                        key: title,
                        render: url => {
                            if (url !== undefined && url !== null) {
                                return (<Link href={url} target="_blank"><LinkedinOutlined /></Link>)
                            }

                        }
                    })
                } else {
                    finalHeaders.push({
                        title: columnTitle,
                        dataIndex: title,
                        key: title
                    })
                }

            }
        };
        setColumns(finalHeaders);
        setDatas(list)
    }, []);

    const onDeleteClick = async () => {
        let datasCopy = [...datas];
        let contactsToDelete = [];
        // console.log(selectedRows);
        for (let row of selectedRows) {
            let userToFind = datasCopy.find(user => user.key === row);
            if (userToFind) {
                contactsToDelete.push(userToFind._id);
                datasCopy = datasCopy.filter(user => user.key !== userToFind.key)
            }
        };
        let data = JSON.stringify(contactsToDelete);
        let request = await fetch('/api/leads', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/Json' },
            body: data
        })
        let response = await request.json();
        if (response.success) {
            setDatas(datasCopy);
            message.success(response.message)
        } else {
            message.error(response.message)
        }
    };

    const onEditClick = () => {
        for (let contact of datas) {
            for (let row of selectedRows) {
                if (contact.key === row) {
                    setContactToEdit(contact)
                }
            }
        };
        setIsEditVisible(true)
    };

    const confirmUpdating = async (contact) => {

        let user = JSON.stringify(contact);
        let request = await fetch('/api/leads', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/Json' },
            body: user
        });
        let response = await request.json();
        if (response.success) {
            message.success('Contact mis à jour !')
            let datasCopy = [...datas];
            for (let i = 0; i < datasCopy.length; i++) {
                if (datasCopy[i].key === contact.key) {
                    datasCopy[i] = contact
                }
            };
            setDatas(datasCopy)
        } else {
            message.error('Erreur lors de la mise à jour... Veuillez réessayer')
        }
    };

    const addContact = contact => {
        let datasCopy = [...datas];
        contact.key = datasCopy.length;
        console.log(contact);
        datasCopy.push(contact);
        setDatas(datasCopy)
    };

    const handleCreateModal = isVisible => setIsCreateVisible(isVisible);

    const handleEditModal = isVisible => setIsEditVisible(isVisible);

    const onSelectChange = rows => {
        setSelectedRows(rows)
    };

    const rowSelection = {
        selectedRows,
        onChange: onSelectChange,
    };

    const handleListChange = async e => {
        let list = e.key === "1" ? "CEO" : "CTO"
        if (list === name) {
            message.error(`Vous êtes actuellement dans la liste ${name}...`)
        } else {
            let datasCopy = [...datas];
            let usersToMove = [];
            for (let row of selectedRows) {
                let userToFind = datasCopy.find(user => user.key === row);
                if (userToFind) {
                    usersToMove.push({
                        id: userToFind._id,
                        list
                    });
                    datasCopy = datasCopy.filter(user => user.key !== userToFind.key)
                }
            };
            let data = JSON.stringify(usersToMove);
            let request = await fetch('/api/list', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/Json' },
                body: data
            });
            let response = await request.json();
            if (response.success) {
                message.success(`Contacts tranférés dans la liste ${list} !`);
                setDatas(datasCopy)
            } else {
                message.error(response.error)
            }
            setSelectedRows([]);
        }
    }

    const menu = (
        <Menu onClick={handleListChange}>
            <Menu.Item key="1">
                CEO
            </Menu.Item>
            <Menu.Item key="2">
                CTO
            </Menu.Item>
        </Menu>
    )

    // console.log(datas);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 25 }}>
            <h1 style={{ marginBottom: 25 }}>Liste sélectionnée : {name}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ width: '100%', marginBottom: 25, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        style={{ marginRight: 5 }}
                        onClick={() => setIsCreateVisible(true)}
                    >
                        Créer un contact
                    </Button>
                    <Dropdown.Button
                        overlay={menu}
                        disabled={selectedRows.length === 0 ? true : false}
                        icon={<UnorderedListOutlined />}
                        placement="topLeft"
                        style={{ marginRight: 5 }}
                    >
                        Déplacer vers
                    </Dropdown.Button>
                    <Button
                        icon={<EditOutlined />}
                        disabled={selectedRows.length !== 1 ? true : false}
                        style={{ marginRight: 5 }}
                        onClick={onEditClick}
                    >
                        Modifier le contact
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        disabled={selectedRows.length === 0 ? true : false}
                        style={{ marginRight: 5 }}
                        danger
                        onClick={onDeleteClick}
                    >
                        {
                            selectedRows.length <= 1
                                ? 'Supprimer le contact'
                                : `Supprimer ${selectedRows.length} contacts`
                        }
                    </Button>
                </div>
                <Table rowSelection={rowSelection} columns={columns} dataSource={datas} />
            </div>
            <EditModal isModalVisible={isEditVisible} showModal={handleEditModal} contact={contactToEdit} confirmUpdating={confirmUpdating} />
            <CreateModal isModalVisible={isCreateVisible} showModal={handleCreateModal} listName={name} addContact={addContact} />
        </div>
    )
};

export async function getServerSideProps({ params }) {
    await DbConnect();
    const list = await leadsModel.find({ list: params.name });
    const leads = list.map(lead => {
        const contact = lead.toObject();
        contact._id = contact._id.toString();
        return contact
    })
    return {
        props: { list: leads }
    }
}

export default List;