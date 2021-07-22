var tables = document.querySelectorAll('table.sortable');

function loadsort()
{
    for (var i = 0; i < tables.length; i++)
    {
        var headers = tables[i].querySelectorAll('th');

        for (var x = 0; x < headers.length; x++)
        {
            var header = headers[x];
            var sortlink = document.createElement('a');
            var datatype = header.dataset.type;

            sortlink.innerHTML = header.innerHTML + '  ▾';
            sortlink.dataset.column = x;
            sortlink.dataset.name = header.innerHTML;
            sortlink.dataset.direction = 'asc';
            sortlink.addEventListener('click', function (e) {
                sort(this);
            });

            headers[x].innerHTML = '';
            headers[x].appendChild(sortlink);
        }
    }
}


function sort(el)
{
    var direction = el.dataset.direction;
    var column = el.dataset.column;

    var table = getTableFromChild(el);
    var rows = table.rows;

    for (var x = 0; x < rows.length; x++)
    {
        var changes = false;

        for (var i = 1; i < rows.length-1; i++)
        {
            var row = rows[i];
            var otherrow = rows[i + 1];
            var parent = row.parentNode;

            var value = rows[i].cells[column].innerHTML;
            var next = rows[i + 1].cells[column].innerHTML;

            if (!isNaN(parseFloat(value))) {
                value = parseFloat(value);
                next = parseFloat(next);
            }

            if (value > next && direction == 'asc') {
                changes = true;
                parent.insertBefore(otherrow, row);
            }

            else if (value < next && direction == 'desc')
            {
                changes = true;
                parent.insertBefore(otherrow, row);
            }
        }

        if (changes == false)
            break;
    }

    el.dataset.direction = direction == 'asc' ? 'desc' : 'asc';
    el.innerHTML = el.dataset.name + (direction == 'asc' ? '  ▾' : '  ▴');
}

function getTableFromChild(child)
{
    var element = child;
    var type = '';

    while (type.toLowerCase() != 'table')
    {
        element = element.parentNode;

        if (element != null)
        {
            type = element.nodeName;
        }

        else
        {
            break;
        }
    }

    return element;
}

loadsort();
